import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { messages, role } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Initialiser Supabase côté serveur avec la clé service_role pour ignorer RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Récupérer la bonne clé d'API et le bon modèle selon le rôle
    const settingKey = role === 'admin' ? 'groq_api_admin' : 'groq_api_user';
    const modelKey = role === 'admin' ? 'groq_model_admin' : 'groq_model_user';

    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [settingKey, modelKey]);

    if (settingsError || !settingsData) {
      return NextResponse.json({ 
        error: `La configuration pour les ${role === 'admin' ? 'administrateurs' : 'utilisateurs'} n'a pas pu être chargée.` 
      }, { status: 400 });
    }

    const apiKeyData = settingsData.find(s => s.key === settingKey);
    const modelData = settingsData.find(s => s.key === modelKey);

    if (!apiKeyData?.value) {
      return NextResponse.json({ 
        error: `La clé API Groq pour les ${role === 'admin' ? 'administrateurs' : 'utilisateurs'} n'est pas configurée dans le panneau d'administration.` 
      }, { status: 400 });
    }

    const apiKey = apiKeyData.value;
    const aiModel = modelData?.value || 'llama-3.3-70b-versatile';

    // Ajouter le prompt système
    const systemPrompt = role === 'admin' 
      ? "Tu es l'assistant IA administrateur de Tech-Geo. Ton but est d'aider le propriétaire de Tech-Geo à gérer son site web, écrire du code, analyser ses ventes et gérer l'électronique. Sois concis, professionnel et technique."
      : "Tu es l'assistant IA de Tech-Geo. Tu aides les clients et utilisateurs de la plateforme avec leurs commandes, leurs projets d'électronique et l'utilisation du site. Sois accueillant, clair et serviable.";

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.text
      }))
    ];

    // Appel à l'API Groq (compatible OpenAI)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: aiModel,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return NextResponse.json({ error: 'Erreur lors de la communication avec Groq' }, { status: response.status });
    }

    const data = await response.json();
    const replyText = data.choices[0]?.message?.content || "Désolé, je n'ai pas pu formuler de réponse.";

    return NextResponse.json({ reply: replyText });
    
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
