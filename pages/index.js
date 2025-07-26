import { useState } from 'react';
import Head from 'next/head';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';

// Add this function right after your imports
const renderMarkdown = (text) => {
  return text
    // Bold text **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text *text* -> <em>text</em>
    .replace(/(?<!\*)\*([^\*\n]+)\*(?!\*)/g, '<em>$1</em>')
    // Code blocks `code` -> <code>code</code>
    .replace(/`([^`]+)`/g, '<code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
    // Numbered lists 1. -> <li>
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> items in <ol>
    .replace(/(<li>.*<\/li>(?:\s*<li>.*<\/li>)*)/gs, '<ol style="margin: 8px 0; padding-left: 20px;">$1</ol>')
    // Convert line breaks to <br>
    .replace(/\n/g, '<br>');
};

export default function Home() {
  const { instance, accounts, inProgress } = useMsal();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error(e);
    });
  };

  const handleLogout = () => {
    instance.logoutPopup().catch(e => {
      console.error(e);
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    
    setLoading(true);
    const userMessage = inputMessage;
    setInputMessage('');
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    try {
      // Use the logged-in user's ID if available
      const userId = accounts[0]?.homeAccountId || 'anonymous';
      
      // Convert recent messages to OpenAI format (last 6 messages)
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const response = await fetch('https://family-ai-functions.azurewebsites.net/api/chatproxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage,
          childId: userId,
          userName: accounts[0]?.name || accounts[0]?.username || 'Unknown User',
          conversationHistory: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.response || 'No response content',
        timestamp: data.timestamp || new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Full error:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.message}. Check console for details.`,
        timestamp: new Date().toISOString()
      }]);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show login screen if not authenticated
  if (accounts.length === 0) {
    return (
      <>
        <Head>
          <title>Wally - RobotTrekker AI Assistant</title>
        </Head>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '20px', 
            textAlign: 'center', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '3px solid #fbbf24'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚀🤖</div>
            <h1 style={{ color: '#1e40af', marginBottom: '10px', fontSize: '28px', fontWeight: 'bold' }}>
              Wally - RobotTrekker AI
            </h1>
            <p style={{ color: '#374151', marginBottom: '10px', fontSize: '16px' }}>
              Math & ELA Learning Assistant
            </p>
            <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '14px' }}>
              Your FIRST Lego League teammate for learning!
            </p>
            <button 
              onClick={handleLogin}
              style={{
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              🔑 Sign In to Start Learning
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Wally - RobotTrekker AI Assistant</title>
        <meta name="description" content="AI learning assistant for team RobotTrekker" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <header style={{ 
          background: 'linear-gradient(135deg, #1e40af, #2563eb)', 
          borderBottom: '3px solid #fbbf24', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: 'white'
        }}>
          <div style={{ 
            maxWidth: '1024px', 
            margin: '0 auto', 
            padding: '16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>🚀🤖</div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  Wally - RobotTrekker AI
                </h1>
                <p style={{ fontSize: '12px', margin: 0, opacity: 0.9 }}>
                  Math & ELA Learning Assistant
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px' }}>
                Welcome, {accounts[0]?.name || accounts[0]?.username}! 👋
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '12px'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '24px' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)', 
            overflow: 'hidden',
            border: '2px solid #e5e7eb'
          }}>
            
            <div style={{ 
              height: '500px', 
              overflowY: 'auto', 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#374151', marginTop: '120px' }}>
                  <div style={{ fontSize: '80px', marginBottom: '16px' }}>🚀🤖</div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1e40af' }}>
                    Hi! I'm Wally! 
                  </h2>
                  <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                    Your RobotTrekker AI teammate for learning Math & ELA!
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Ask me about homework concepts, FLL strategies, or just chat!
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start' 
                  }}>
                    <div style={{
                      maxWidth: '75%',
                      padding: '14px 18px',
                      borderRadius: '18px',
                      background: message.type === 'user' 
                        ? 'linear-gradient(135deg, #1e40af, #2563eb)' 
                        : message.type === 'error' 
                        ? '#fef2f2' 
                        : 'white',
                      color: message.type === 'user' 
                        ? 'white' 
                        : message.type === 'error' 
                        ? '#dc2626' 
                        : '#374151',
                      boxShadow: message.type === 'user' 
                        ? '0 4px 8px rgba(30, 64, 175, 0.3)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      border: message.type === 'assistant' ? '1px solid #e5e7eb' : 'none'
                    }}>
                      {message.type === 'assistant' && (
                        <div style={{ 
                          fontSize: '12px', 
                          marginBottom: '6px', 
                          fontWeight: 'bold',
                          color: '#1e40af'
                        }}>
                          🤖 Wally
                        </div>
                      )}
                      <div 
                        style={{ margin: 0, lineHeight: '1.5' }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                      />
                      <p style={{ 
                        margin: '6px 0 0 0', 
                        fontSize: '11px', 
                        opacity: 0.7,
                        textAlign: message.type === 'user' ? 'right' : 'left'
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ 
                    background: 'white', 
                    color: '#374151', 
                    padding: '14px 18px', 
                    borderRadius: '18px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 'bold', color: '#1e40af' }}>
                      🤖 Wally
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', marginRight: '8px' }}>Thinking...</span>
                      <div style={{ width: '6px', height: '6px', background: '#1e40af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
                      <div style={{ width: '6px', height: '6px', background: '#1e40af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.16s' }}></div>
                      <div style={{ width: '6px', height: '6px', background: '#1e40af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.32s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ 
              borderTop: '2px solid #e5e7eb', 
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', 
              padding: '20px' 
            }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Wally about math, reading, FLL, or anything else! 🚀"
                  style={{
                    flex: 1,
                    resize: 'none',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'Arial, sans-serif'
                  }}
                  rows="2"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !inputMessage.trim()}
                  style={{
                    padding: '12px 20px',
                    background: loading || !inputMessage.trim() 
                      ? '#d1d5db' 
                      : 'linear-gradient(135deg, #1e40af, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    boxShadow: loading || !inputMessage.trim() ? 'none' : '0 4px 8px rgba(30, 64, 175, 0.3)'
                  }}
                >
                  {loading ? '⏳' : '🚀'}
                </button>
              </div>
              
              {/* Subject-specific suggestion buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { text: 'Math Help', icon: '🔢', category: 'math' },
                  { text: 'Reading & Writing', icon: '📚', category: 'ela' },
                  { text: 'FLL Strategy', icon: '🤖', category: 'fll' },
                  { text: 'Science Facts', icon: '🔬', category: 'science' },
                  { text: 'Creative Writing', icon: '✍️', category: 'creative' }
                ].map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => setInputMessage(`Help me with ${suggestion.text.toLowerCase()}`)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      background: 'white',
                      border: '1px solid #1e40af',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      color: '#1e40af',
                      transition: 'all 0.2s',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    disabled={loading}
                    onMouseOver={(e) => {
                      e.target.style.background = '#1e40af';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = '#1e40af';
                    }}
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Team info and safety notice */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
            <p style={{ marginBottom: '4px' }}>
              🏆 <strong>Team RobotTrekker</strong> - FIRST Lego League 2025
            </p>
            <p>🛡️ Safe learning environment with conversation monitoring for educational support</p>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          } 40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}