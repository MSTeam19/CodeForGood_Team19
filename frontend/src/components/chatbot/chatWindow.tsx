import { useState, useRef, useEffect, type FormEvent } from 'react';
import './ChatWindow.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface KnowledgeDoc {
  content: string;
  embedding: number[];
}

const ChatWindow = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Initializing AI...');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isAtMainMenu, setIsAtMainMenu] = useState(true);

  // refs for ai models and knowledge base
  const extractorRef = useRef<any>(null);
  const generatorRef = useRef<any>(null);
  const knowledgeBaseRef = useRef<KnowledgeDoc[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // initialise AI and fetch knowledge base once on mount
  useEffect(() => {
    const initialiseAI = async () => {
      try {
        const { pipeline } = await import('@xenova/transformers');

        setStatus('Loading AI models...');
        extractorRef.current = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        generatorRef.current = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');

        setStatus('Fetching knowledge...');
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-knowledge-base`);
        if (!response.ok) throw new Error("Failed to fetch knowledge base");
        const { documents } = await response.json();
        knowledgeBaseRef.current = documents;

        // initial welcome message after everything is loaded
        setMessages([
          { id: Date.now(), text: "Hi, I'm REACH's virtual assistant! How can I help you today?", sender: 'bot' }
        ]);
        setStatus('Ready to help!');

      } catch (error) {
        console.error("AI Initialisation failed:", error);
        setStatus('Error: Could not load AI.');
        setMessages([{ id: Date.now(), text: "Sorry, I'm having trouble starting up. Please try again later.", sender: 'bot' }]);
      }
    };
    initialiseAI();
  }, []);

  // auto scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);


  // handler for predefined topic buttons
  const handleButtonClick = async (topic: string, displayText: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text: displayText, sender: 'user' }]);
    setStatus('Thinking...');
    setIsAtMainMenu(false);

    let botResponse = "I'm sorry, I don't have information on that topic right now.";

    // handle structured queries
    // hardcoded for now to test
    if (topic === 'active_campaigns') {
        // info on current campaigns
      botResponse = "Our current campaigns include...";
    } else if (topic === 'how_to_donate') {
        // provide donation link or info
      botResponse = "You can donate via...";
    } else if (topic === 'contact_us') {
        // maybe provide link to contact page
      botResponse = "For general inquiries, you can email our team at ...";
    }
    
    setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        setStatus('Ready to help!');
    }, 500);
  };

  // handler for the free text input form (RAG pipeline)
  const handleCustomQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'Ready to help!') return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput('');
    setStatus('Thinking...');
    setIsAtMainMenu(false);

    try {
      const { cos_sim } = await import('@xenova/transformers');
      const queryEmbedding = await extractorRef.current(query, { pooling: 'mean', normalize: true });

      const scores = knowledgeBaseRef.current.map(doc => ({
          score: cos_sim(queryEmbedding.data, doc.embedding),
          content: doc.content
      }));
      scores.sort((a, b) => b.score - a.score);
      
      const context = scores.slice(0, 3).map(item => item.content).join('\n\n---\n\n');
      
      const prompt = `Based only on the provided context, answer the user's question. If the context doesn't contain the answer, say "I'm sorry, I don't have that specific information."\n\nContext:\n${context}\n\nQuestion:\n${query}\n\nAnswer:`;

      const result = await generatorRef.current(prompt, { max_new_tokens: 250, skip_special_tokens: true });
      const botResponse = result[0].generated_text.trim();
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error("Error during RAG generation:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I encountered an error while processing your request.", sender: 'bot' }]);
    } finally {
      setStatus('Ready to help!');
    }
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
              setIsAtMainMenu(false); // <-- UPDATE
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
            placeholder={status === 'Ready to help!' ? 'Ask a question...' : status}
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