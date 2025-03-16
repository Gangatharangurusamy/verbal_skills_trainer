import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./VoiceAnalysis.css";

type Message = {
  id: number;
  sender: "AI" | "User";
  content: string;
  audioUrl?: string; // Optional audio URL for AI responses
};

const VoiceAnalysis: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "AI", content: "Hello! Upload an audio file or record your voice for analysis." }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // User ID would typically come from authentication
  const userId = "john-doe";
  // Backend URL configuration
  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending text to the backend for text-to-speech
  const handleSend = async () => {
    if (!inputMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    // Add user message to chat
    const userMessageId = Date.now();
    setMessages(prev => [...prev, { id: userMessageId, sender: "User", content: inputMessage }]);

    // Clear input field
    const userMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Construct the URL with query parameters
      const url = new URL(`${API_URL}/voice/text-to-tts/`);
      url.searchParams.append("user_id", userId);
      url.searchParams.append("text", userMessage);

      console.log("Request URL:", url.toString());

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend Response:", data);

      // Construct the audio URL consistently
      const audioUrl = `${API_URL}/static/${data.audio_file}`;
      console.log("Audio URL:", audioUrl);

      // Add AI response to chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "AI",
        content: data.ai_response,
        audioUrl: audioUrl
      }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "AI",
        content: "Sorry, I'm having trouble analyzing your request. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload for speech-to-text
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Use URL with query parameters for user_id
      const url = new URL(`${API_URL}/voice/stt/`);
      url.searchParams.append("user_id", userId);
      
      console.log("Upload URL:", url.toString());
      
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend Response:", data);

      // Construct the audio URL consistently
      const audioUrl = `${API_URL}/static/${data.audio_file}`;
      console.log("Audio URL:", audioUrl);

      // Add user's transcribed message
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "User",
        content: data.transcribed_text
      }]);

      // Add AI response with audio
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "AI",
        content: data.ai_response,
        audioUrl: audioUrl
      }]);
    } catch (error) {
      console.error("Failed to process audio file:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "AI",
        content: "Sorry, I couldn't analyze that audio file. Please try again."
      }]);
    } finally {
      setIsLoading(false);
      // Clear the file input
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  // Handle recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToAPI(audioBlob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access your microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send recorded audio to the backend
  const sendAudioToAPI = async (audioBlob: Blob) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav");
      
      // Use URL with query parameters for user_id
      const url = new URL(`${API_URL}/voice/stt/`);
      url.searchParams.append("user_id", userId);
      
      console.log("Upload URL:", url.toString());
      
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend Response:", data);

      // Construct the audio URL consistently
      const audioUrl = `${API_URL}/static/${data.audio_file}`;
      console.log("Audio URL:", audioUrl);

      // Add user's transcribed message
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "User",
        content: data.transcribed_text
      }]);

      // Add AI response with audio
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "AI",
        content: data.ai_response,
        audioUrl: audioUrl
      }]);
    } catch (error) {
      console.error("Failed to process audio recording:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "AI",
        content: "Sorry, I couldn't process your recording. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const triggerFileUpload = () => {
    audioInputRef.current?.click();
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-title">
            <span className="ai-icon">🎵</span> Voice Analysis Tool
          </div>
          <div className="user-info">
            <Link to="/" className="back-to-dashboard">
              &larr; Dashboard
            </Link>
            <span className="user-avatar">👤</span>
            <span className="user-name">{userId}</span>
          </div>
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
                    <span className="ai-icon-small">🎵</span>
                  </div>
                ) : (
                  <div className="message-sender">
                    <span className="user-icon-small">👤</span>
                  </div>
                )}
                <div className="message-text">
                  {message.content}
                  {message.audioUrl && (
                    <div className="audio-player-container">
                      <audio controls src={message.audioUrl} className="audio-player" onError={(e) => console.error("Audio error:", e)}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai-message">
              <div className="message-content">
                <div className="message-sender">
                  <span className="ai-icon-small">🎵</span>
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
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            ref={audioInputRef}
            style={{ display: 'none' }}
          />
          <button
            onClick={triggerFileUpload}
            className="upload-button"
            title="Upload audio file"
            disabled={isLoading || isRecording}
          >
            📎
          </button>
          <button
            onClick={toggleRecording}
            className={`mic-button ${isRecording ? 'recording' : ''}`}
            title={isRecording ? "Stop recording" : "Start recording"}
            disabled={isLoading}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading || isRecording}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputMessage.trim() || isRecording}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAnalysis;