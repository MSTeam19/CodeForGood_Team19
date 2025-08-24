import { useState, useRef, useEffect, type FormEvent } from 'react';
import './ChatWindow.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatWindow = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Ready to help!');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isAtMainMenu, setIsAtMainMenu] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { id: Date.now(), text: "Hi, I'm REACH's virtual assistant! How can I help you today?", sender: 'bot' }
    ]);
  }, []);    

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // call the backend API for RAG
  const generateRAGResponse = async (query: string): Promise<string> => {
    try {
      // fetch knowledge base from supabase
      const context = mockKnowledgeBase
        .map(doc => doc.content)
        .join('\n\n---\n\n');

      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.answer || "Sorry, I couldn't get a valid response.";

    } catch (error) {
      console.error("Error calling generation API:", error);
      return "Sorry, I encountered an error while processing your request.";
    }
  };

  const handleButtonClick = async (topic: string, displayText: string) => {
    setIsAtMainMenu(false);
    setMessages(prev => [...prev, { id: Date.now(), text: displayText, sender: 'user' }]);
    setStatus('Thinking...');

    let botResponse = "";

    if (topic === 'active_campaigns') {
      const activeProjects = mockProjects.filter(p => p.is_active);
      if (activeProjects.length > 0) {
        const projectNames = activeProjects.map(p => `'${p.name}'`).join(' and ');
        botResponse = `We have ${activeProjects.length} active campaigns right now: ${projectNames}.`;
      } else {
        botResponse = "We don't have any active campaigns at the moment, but please check back soon!";
      }
      setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
          setStatus('Ready to help!');
      }, 500);
    } else {
      const queryForRAG = displayText;
      botResponse = await generateRAGResponse(queryForRAG);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      setStatus('Ready to help!');
    }
  };

  const handleCustomQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'Ready to help!') return;

    setIsAtMainMenu(false);
    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput('');
    setStatus('Thinking...');
    
    const botResponse = await generateRAGResponse(query);
    
    setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
    setStatus('Ready to help!');
  };

  const handleGoBack = () => {
    setIsAtMainMenu(true);
    setShowCustomInput(false);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: "Sure, what else can I help you with?",
      sender: 'bot'
    }]);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>REACH Helper</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>{msg.text}</div>
        ))}

        {isAtMainMenu && (
          <div className="chat-buttons">
            <button onClick={() => handleButtonClick('active_campaigns', 'Tell me about active campaigns')}>Active Campaigns</button>
            <button onClick={() => handleButtonClick('how_to_donate', 'How can I donate?')}>How to Donate</button>
            <button onClick={() => handleButtonClick('contact_us', 'How do I contact you?')}>Contact Us</button>
            <button onClick={() => { 
              setShowCustomInput(true); 
              setIsAtMainMenu(false);
              setMessages(prev => [...prev, {id: Date.now(), text: "I have a specific question.", sender: 'user'}]);
            }}>Ask something else...</button>
          </div>
        )}
        
        {!isAtMainMenu && status === 'Ready to help!' && (
          <div className="chat-buttons">
            <button onClick={handleGoBack} className="back-button">
              ‹ Back to Main Menu
            </button>
          </div>
        )}

        {status === 'Thinking...' && (
          <div className="message bot">
            <div className="typing-indicator-container"><span className="typing-indicator"></span></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showCustomInput && (
        <form onSubmit={handleCustomQuery} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={status === 'Ready to help!' ? 'Ask a question...' : 'AI is thinking...'}
            disabled={status !== 'Ready to help!'}
            autoFocus
          />
          <button type="submit" disabled={status !== 'Ready to help!'} aria-label="Send Message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatWindow;