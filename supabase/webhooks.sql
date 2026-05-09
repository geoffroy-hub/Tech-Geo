-- ===================================================
-- Tech-geo — Supabase Database Webhooks
-- ===================================================
-- Webhooks trigger Edge Functions on database events.
-- Configure in Supabase Dashboard → Database → Webhooks
-- or run these SQL commands to set up event triggers.
-- ===================================================

-- ===================================================
-- 1. WEBHOOK: New Order Created
-- Triggers email notification to admin and customer
-- ===================================================

-- Create the webhook via SQL (Supabase manages HTTP hooks internally)
-- In the Supabase Dashboard, configure:
--   - Event: INSERT on "orders"
--   - URL: https://<project-id>.functions.supabase.co/notify-order
--   - Method: POST
--   - Headers: Content-Type: application/json
--   - Body template: {"orderId": "{{id}}", "type": "confirmation"}

-- Alternative: Use pg_net extension for direct HTTP calls
-- First enable the extension:
-- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Then create the trigger function:
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Send webhook to Edge Function for email notifications
  PERFORM net.http_post(
    url := current_setting('app.settings.webhook_url', true) || '/notify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_key', true)
    ),
    body := jsonb_build_object(
      'orderId', NEW.id,
      'type', 'confirmation'
    )::text,
    timeout_milliseconds := 5000
  );

  -- Also send admin notification
  PERFORM net.http_post(
    url := current_setting('app.settings.webhook_url', true) || '/notify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_key', true)
    ),
    body := jsonb_build_object(
      'orderId', NEW.id,
      'type', 'admin_notification'
    )::text,
    timeout_milliseconds := 5000
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_new_order ON orders;
CREATE TRIGGER trigger_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- ===================================================
-- 2. WEBHOOK: Order Status Changed
-- Triggers email notification to customer
-- ===================================================

CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.webhook_url', true) || '/notify-order',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_key', true)
      ),
      body := jsonb_build_object(
        'orderId', NEW.id,
        'type', 'status_update'
      )::text,
      timeout_milliseconds := 5000
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_order_status_change ON orders;
CREATE TRIGGER trigger_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- ===================================================
-- 3. WEBHOOK: New Contact Message
-- Triggers admin notification email
-- ===================================================

CREATE OR REPLACE FUNCTION notify_new_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Send webhook to admin notification endpoint
  PERFORM net.http_post(
    url := current_setting('app.settings.webhook_url', true) || '/notify-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_key', true)
    ),
    body := jsonb_build_object(
      'messageId', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'subject', NEW.subject
    )::text,
    timeout_milliseconds := 5000
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_new_contact ON contact_messages;
CREATE TRIGGER trigger_new_contact
  AFTER INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_contact_message();

-- ===================================================
-- CONFIGURATION
-- Set these values in Supabase Dashboard → Settings → Database
-- or run as SQL (requires superuser access):
-- ===================================================

-- ALTER DATABASE postgres SET "app.settings.webhook_url" TO 'https://<project-id>.functions.supabase.co';
-- ALTER DATABASE postgres SET "app.settings.service_key" TO '<service-role-key>';

-- ===================================================
-- ALTERNATIVE: Dashboard Webhook Configuration
-- ===================================================
-- If pg_net is not available, configure webhooks via the Dashboard:
--
-- 1. Go to Database → Webhooks
-- 2. Click "Create Webhook"
-- 3. Configure each webhook:
--
-- Webhook 1: New Order
--   Name: "notify-new-order"
--   Table: orders
--   Event: INSERT
--   URL: https://<project-id>.functions.supabase.co/notify-order
--   Method: POST
--   Headers:
--     Content-Type: application/json
--     Authorization: Bearer <anon-key>
--   Request body: {"orderId": "{{id}}", "type": "confirmation"}
--   Retry: 3 attempts
--
-- Webhook 2: Order Status Update
--   Name: "notify-order-status"
--   Table: orders
--   Event: UPDATE
--   Filter: status CHANGED
--   URL: https://<project-id>.functions.supabase.co/notify-order
--   Method: POST
--   Headers:
--     Content-Type: application/json
--     Authorization: Bearer <anon-key>
--   Request body: {"orderId": "{{id}}", "type": "status_update"}
--   Retry: 3 attempts
--
-- Webhook 3: New Contact Message
--   Name: "notify-new-contact"
--   Table: contact_messages
--   Event: INSERT
--   URL: https://<project-id>.functions.supabase.co/notify-contact
--   Method: POST
--   Headers:
--     Content-Type: application/json
--     Authorization: Bearer <anon-key>
--   Request body: {"messageId": "{{id}}"}
--   Retry: 3 attempts
