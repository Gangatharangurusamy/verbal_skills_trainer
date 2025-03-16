import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./ChatPage.css";

type Message = {
  id: number;
  sender: "AI" | "User";
  content: string;
};

type ConversationType = "job_interviewer" | "casual_friend" | "debate_opponent";

const ChatPage: React.FC = () => {
  const [conversationType, setConversationType] = useState<ConversationType>("job_interviewer");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial greeting based on conversation type
  const getInitialGreeting = (type: ConversationType): string => {
    switch (type) {
      case "job_interviewer":
        return "Welcome to your interview session. Could you start by telling me about your professional background?";
      case "casual_friend":
        return "Hey there! What's been going on with you lately?";
      case "debate_opponent":
        return "I'm ready to discuss any topic you'd like to debate. What subject should we explore today?";
      default:
        return "Hello! How can I assist you today?";
    }
  };
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "AI", content: getInitialGreeting("job_interviewer") }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // User ID would typically come from authentication
  const userId = "ganga123";

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessageId = Date.now();
    setMessages(prev => [...prev, { id: userMessageId, sender: "User", content: inputMessage }]);
    
    // Clear input field
    const userMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          user_message: userMessage,
          conversation_type: conversationType
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [...prev, { id: Date.now(), sender: "AI", content: data.bot_response }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { id: Date.now(), sender: "AI", content: "Sorry, I'm having trouble responding. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConversationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ConversationType;
    setConversationType(newType);
    
    // Reset the chat with a new greeting when conversation type changes
    setMessages([
      { id: Date.now(), sender: "AI", content: getInitialGreeting(newType) }
    ]);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-title">
            <span className="ai-icon">🤖</span> AI Chat
          </div>
          <div className="user-info">
            <Link to="/" className="back-to-dashboard">
              &larr; Dashboard
            </Link>
            <span className="user-avatar">👤</span>
            <span className="user-name">{userId}</span>
          </div>
        </div>
        
        <div className="chat-select-container">
          <label htmlFor="conversation-type">Select AI Role:</label>
          <select
            id="conversation-type"
            value={conversationType}
            onChange={handleConversationTypeChange}
            className="conversation-selector"
          >
            <option value="job_interviewer">Job Interviewer</option>
            <option value="casual_friend">Casual Friend</option>
            <option value="debate_opponent">Debate Opponent</option>
          </select>
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === "AI" ? "ai-message" : "user-message"}`}
            >
              <div className="message-content">
                {message.sender === "AI" ? (
                  <div className="message-sender">
                    <span className="ai-icon-small">🤖</span>
                  </div>
                ) : (
                  <div className="message-sender">
                    <span className="user-icon-small">👤</span>
                  </div>
                )}
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai-message">
              <div className="message-content">
                <div className="message-sender">
                  <span className="ai-icon-small">🤖</span>
                </div>
                <div className="message-text typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !inputMessage.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;