import { useState, lazy, Suspense } from 'react';
import './Chatbot.css';

const ChatWindow = lazy(() => import('./chatWindow'));

// loading component while main component loads (chat window)
const ChatbotLoader = () => (
  <div className="chat-window-loader">
    <div className="spinner"></div>
    <p>Waking up the AI assistant...</p>
  </div>
);

const ChatIcon = () => (
    <svg xmlns="" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <Suspense fallback={<ChatbotLoader />}>
          <ChatWindow onClose={toggleChat} />
        </Suspense>
      )}
      <button className="chatbot-toggle-button" onClick={toggleChat} aria-label="Toggle Chatbot">
         {isOpen ? '✕' : <ChatIcon />}
      </button>
    </div>
  );
};

export default Chatbot;