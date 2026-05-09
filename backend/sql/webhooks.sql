-- ===================================================
-- Tech-geo — Supabase Database Webhooks
-- ===================================================
-- Configure via Dashboard → Database → Webhooks
-- or use pg_net extension for direct HTTP calls.
-- ===================================================

-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ===================================================
-- 1. New Order → Email notifications
-- ===================================================

CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Customer confirmation
  PERFORM net.http_post(
    url := current_setting('app.settings.webhook_url', true) || '/notify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_key', true)
    ),
    body := jsonb_build_object('orderId', NEW.id, 'type', 'confirmation')::text,
    timeout_milliseconds := 5000
  );

  -- Admin notification
  PERFORM net.http_post(
    url := current_setting('app.settings.webhook_url', true) || '/notify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_key', true)
    ),
    body := jsonb_build_object('orderId', NEW.id, 'type', 'admin_notification')::text,
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
-- 2. Order Status Changed → Customer email
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
      body := jsonb_build_object('orderId', NEW.id, 'type', 'status_update')::text,
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
-- 3. New Contact Message → Admin notification
-- ===================================================

CREATE OR REPLACE FUNCTION notify_new_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
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
-- CONFIG (set in Supabase Dashboard or run as superuser)
-- ===================================================
-- ALTER DATABASE postgres SET "app.settings.webhook_url" TO 'https://<project>.functions.supabase.co';
-- ALTER DATABASE postgres SET "app.settings.service_key" TO '<service-role-key>';
