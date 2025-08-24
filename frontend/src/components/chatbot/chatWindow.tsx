// src/components/chatbot/chatWindow.tsx

import { useState, useRef, useEffect, type FormEvent } from 'react';
import './chatbot.css';
import type { Campaign } from '../data/staticKnowledge'; 
import { staticKnowledgeBase } from '../data/staticKnowledge';
import BotMessage from './botMessage';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

type ChatView = 'main_menu' | 'active_campaigns' | 'donation_options';

// NEW: A simple keyword matcher to check our static knowledge base first.
const findStaticResponse = (query: string): string | null => {
  const lowerCaseQuery = query.toLowerCase();

  // Map keywords to static knowledge base keys
  const keywordMap: { [key: string]: Array<string> } = {
    how_to_donate: ['donate', 'give', 'contribution', 'support'],
    donation_tiers: ['tiers', 'levels', 'amounts'],
    mission_statement: ['mission', 'vision', 'goal', 'purpose'],
    contact_info: ['contact', 'email', 'phone', 'address'],
    impact_stories: ['stories', 'impact', 'testimonials'],
  };

  for (const key in keywordMap) {
    if (keywordMap[key].some(keyword => lowerCaseQuery.includes(keyword))) {
      return staticKnowledgeBase[key as keyof typeof staticKnowledgeBase]?.content || null;
    }
  }

  return null;
};


const ChatWindow = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'Ready to help!' | 'Thinking...'>('Ready to help!');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [currentView, setCurrentView] = useState<ChatView>('main_menu');
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: Date.now(), text: "Hi, I'm REACH's virtual assistant! How can I help you today?", sender: 'bot' }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateRAGResponse = async (query: string): Promise<{ answer: string; anchor?: string }> => {
    try {
      const response = await fetch('http://localhost:3000/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error calling generation API:", error);
      return { answer: "Sorry, I encountered an error while processing your request." };
    }
  };

  const handleMainMenuSelect = async (topic: ChatView | 'contact_us' | 'ask_something', displayText: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text: displayText, sender: 'user' }]);
    
    if (topic === 'active_campaigns') {
      setStatus('Thinking...');
      try {
        const response = await fetch('http://localhost:3000/campaigns/active'); 
        if (!response.ok) throw new Error('Failed to fetch campaigns.');
        const campaigns: Campaign[] = await response.json();
        setActiveCampaigns(campaigns);
        setCurrentView('active_campaigns');
        const promptText = campaigns.length > 0
          ? "Of course, here are our active campaigns. Which one would you like to know more about?"
          : "We don't have any active campaigns at the moment, but please check back soon!";
        setMessages(prev => [...prev, { id: Date.now() + 1, text: promptText, sender: 'bot' }]);
      } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I had trouble fetching the campaign list.", sender: 'bot' }]);
      } finally {
        setStatus('Ready to help!');
      }
    } else if (topic === 'donation_options') {
      setCurrentView(topic);
      const promptText = "Certainly. What would you like to know about donating?";
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: promptText, sender: 'bot' }]);
      }, 300);
    } else if (topic === 'contact_us') {
      const botResponse = staticKnowledgeBase.contact_info.content;
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      }, 300);
    } else if (topic === 'ask_something') {
      setShowCustomInput(true);
      setCurrentView('main_menu');
    }
  };

  const handleCampaignSelect = (campaign: Campaign) => {
    setCurrentView('main_menu');
    const userMessage = `Tell me more about '${campaign.name}'`;
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
    setStatus('Thinking...');
    const botResponse = `Great choice! The '${campaign.name}' campaign is about: ${campaign.description}`;
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      setStatus('Ready to help!');
    }, 500);
  };
  
  const handleStaticKnowledgeQuery = (key: keyof typeof staticKnowledgeBase, displayText: string) => {
    setCurrentView('main_menu');
    setMessages(prev => [...prev, { id: Date.now(), text: displayText, sender: 'user' }]);
    
    const botResponse = staticKnowledgeBase[key]?.content;
    
    if (botResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      }, 300);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I don't have information on that topic.", sender: 'bot' }]);
      }, 300);
    }
  };
  
  // UPDATED: This function now checks for a static response before calling the RAG API.
  const handleCustomQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'Ready to help!') return;
    const query = input;
    setInput('');
    setShowCustomInput(false);
    setCurrentView('main_menu');
    
    setMessages(prev => [...prev, { id: Date.now(), text: query, sender: 'user' }]);

    // Step 1: Check for a simple, static response first.
    const staticResponse = findStaticResponse(query);
    if (staticResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: staticResponse, sender: 'bot' }]);
      }, 300);
      return; // Found a local answer, no need to call the API.
    }

    // Step 2: If no static response, fall back to the RAG API.
    setStatus('Thinking...');
    const result = await generateRAGResponse(query);
    let botMessageText = result.answer;

    if (result.anchor) {
      botMessageText += ` <a href="${result.anchor}" class="chatbot-anchor-link">Learn more on our page.</a>`;
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, text: botMessageText, sender: 'bot' }]);
    setStatus('Ready to help!');
  };

  const handleGoBack = () => {
    setCurrentView('main_menu');
    setMessages(prev => [...prev, { id: Date.now(), text: "Sure, what else can I help you with?", sender: 'bot' }]);
  };
  
  const renderChatButtons = () => {
    if (status !== 'Ready to help!') return null;

    switch (currentView) {
      case 'main_menu':
        return (
          <div className="chat-buttons">
            <button onClick={() => handleMainMenuSelect('active_campaigns', 'View Active Campaigns')}>View Active Campaigns</button>
            <button onClick={() => handleMainMenuSelect('donation_options', 'How to Donate')}>How to Donate</button>
            <button onClick={() => handleMainMenuSelect('contact_us', 'How do I contact you?')}>Contact Us</button>
            <button onClick={() => handleMainMenuSelect('ask_something', 'Ask something else...')}>Ask something else...</button>
          </div>
        );
      case 'active_campaigns':
        return (
          <div className="chat-buttons">
            {activeCampaigns.map(campaign => (
              <button key={campaign.id} onClick={() => handleCampaignSelect(campaign)}>
                {campaign.name}
              </button>
            ))}
            <button onClick={handleGoBack} className="back-button">‹ Back to Main Menu</button>
          </div>
        );
      case 'donation_options':
        return (
          <div className="chat-buttons">
            <button onClick={() => handleStaticKnowledgeQuery('how_to_donate', 'How can I donate?')}>How to Donate</button>
            <button onClick={() => handleStaticKnowledgeQuery('donation_tiers', 'What are the donation tiers?')}>Donation Tiers</button>
            <button onClick={handleGoBack} className="back-button">‹ Back to Main Menu</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>REACH Helper</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
        <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.sender === 'bot' ? <BotMessage text={msg.text} /> : msg.text}
        </div>
        ))}
        {!showCustomInput && renderChatButtons()}
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
            placeholder={'Ask a specific question...'}
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