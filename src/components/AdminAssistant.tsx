'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'bot' | 'user';
  text: string;
};

interface AdminAssistantProps {
  role?: 'admin' | 'user';
}

export default function AdminAssistant({ role = 'admin' }: AdminAssistantProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: role === 'admin' 
        ? "Bonjour Administrateur ! Je suis votre assistant de gestion **Tech-Geo**. Je peux vous aider à analyser vos ventes, gérer vos produits ou déboguer du code complexe. Que faisons-nous aujourd'hui ?"
        : "Salut ! Je suis ton compagnon de projet **Tech-Geo**. Je suis là pour t'aider dans tes montages électroniques, ton code Arduino ou pour le suivi de tes commandes. Comment puis-je t'aider à progresser ?"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    // Ajouter le message de l'utilisateur
    const newMessages: Message[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, role })
      });

      const data = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'bot', text: `⚠️ Erreur: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Une erreur réseau est survenue.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSend = (text: string) => {
    setInput(text);
  };

  return (
    <div className={`admin-assistant-container ${role}-mode`}>
      
      {/* Zone de Chat Principal */}
      <div className="admin-assistant-chat">
        
        {/* Messages */}
        <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              gap: '1rem', 
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: msg.role === 'bot' ? 'linear-gradient(135deg, var(--clr-accent) 0%, #0abde3 100%)' : '#333',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.1rem'
              }}>
                {msg.role === 'bot' ? '🤖' : '👤'}
              </div>
              <div style={{ 
                background: msg.role === 'bot' ? 'rgba(255,255,255,0.05)' : 'var(--clr-accent)',
                color: msg.role === 'bot' ? 'inherit' : '#fff',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: msg.role === 'bot' ? '1px solid var(--clr-border)' : 'none',
                maxWidth: '80%',
                lineHeight: '1.5'
              }}>
                {msg.text}
                {msg.role === 'bot' && idx === 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {(role === 'admin' 
                      ? ['📊 Analyser ventes', '📦 Gérer stock', '💻 Code Arduino', '🤖 Prompt Engineering']
                      : ['🔌 Aide montage', '💻 Code Arduino', '📦 Suivre commande', '💡 Idée projet']
                    ).map(tag => (
                      <span key={tag} onClick={() => handleQuickSend(tag)} style={{ 
                        padding: '0.3rem 0.6rem', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid var(--clr-border)', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={1}
            placeholder="Posez votre question sur l'électronique, le code ou la gestion..."
            style={{ 
              flex: 1, 
              resize: 'none', 
              background: 'transparent', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '24px', 
              padding: '0.75rem 1.25rem', 
              color: '#fff', 
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ 
              borderRadius: '50%', 
              width: '45px', 
              height: '45px', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <span className="spinner" style={{ width: 20, height: 20 }}></span>
            ) : (
              <span style={{ fontSize: '1.2rem', marginLeft: '-2px' }}>➤</span>
            )}
          </button>
        </div>
      </div>

      {/* Accès rapide - Uniquement pour Admin */}
      {role === 'admin' && (
        <div className="admin-assistant-quick-access">
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
              ⚡ Accès Rapide
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                '📊 Rapport de ventes mensuel',
                '📦 Vérifier les stocks bas',
                '🔌 Code API Supabase',
                '📝 Aide pour rédiger un tuto',
                '💡 Idées marketing'
              ].map((btn, i) => (
                <button key={i} onClick={() => handleQuickSend(btn)} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--clr-border)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textAlign: 'left',
                  color: 'var(--clr-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.85rem'
                }}
                onMouseOver={e => e.currentTarget.style.color = '#fff'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--clr-muted)'}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Droite - Uniquement pour Admin */}
      {role === 'admin' && (
        <div className="admin-assistant-sidebar">
          
          {/* Base de connaissance */}
          <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(4, 187, 255, 0.05) 0%, transparent 100%)', border: '1px solid rgba(4, 187, 255, 0.2)' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--clr-accent)', marginBottom: '1rem' }}>
              🧠 Base de connaissance
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>✅ Électronique & IoT</div>
              <div>✅ React & Next.js</div>
              <div>✅ Base de données Supabase</div>
              <div>✅ E-commerce & Ventes</div>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem', color: '#0abde3', textAlign: 'center' }}>
              🔌 Assistant connecté
            </div>
          </div>
          
          <button 
            onClick={() => setMessages([{role: 'bot', text: 'Conversation réinitialisée ! Comment puis-je vous aider ?'}])}
            style={{
              background: 'none',
              border: '1px solid var(--clr-border)',
              padding: '0.75rem',
              borderRadius: '8px',
              color: '#ff4757',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🗑️ Effacer la conversation
          </button>

        </div>
      )}
    </div>
  );
}
