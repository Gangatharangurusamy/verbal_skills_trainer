import React, { useState } from "react";

const modules = [
  { id: "impromptu_speaking", name: "Impromptu Speaking", prompt: "Explain why teamwork is important." },
  { id: "storytelling", name: "Storytelling", prompt: "Narrate a short story with an engaging plot." },
  { id: "conflict_resolution", name: "Conflict Resolution", prompt: "Respond to the scenario: 'I'm upset because you missed a deadline.'" }
];

const TrainingApp = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setUserInput("");
    setFeedback("");
    setAudioUrl("");
  };

  const handleInputChange = (e) => setUserInput(e.target.value);

  // Handle text input submission (JSON format)
  const handleSubmit = async () => {
    if (!selectedModule || !userInput.trim()) return;
    
    setIsLoading(true);

    // Format for text JSON submission
    const requestBody = {
      user_id: "12345", // Replace with actual user ID
      module: selectedModule.id,
      user_response: userInput,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/skills/train/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Error submitting response:", error);
      setFeedback("Error: Could not process your response.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice input submission (file upload)
  const handleVoiceInput = async () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    
    if (!selectedModule) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = async (event) => {
      const recordedText = event.results[0][0].transcript;
      setUserInput(recordedText);
      setIsRecording(false);
      
      // Simulate recording an audio file
      const audioBlob = await recordAudio();
      setAudioUrl(URL.createObjectURL(audioBlob));

      // Send the audio file to the backend
      processAudioRecording(audioBlob);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setIsLoading(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // Simulate recording an audio file
  const recordAudio = async () => {
    return new Promise((resolve) => {
      const audioContext = new AudioContext();
      const mediaStream = navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(mediaStream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        resolve(audioBlob);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
    });
  };

  // Process and send the audio file to the backend
  const processAudioRecording = async (audioBlob) => {
    setIsLoading(true);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    // Add user_id as a query parameter
    const url = new URL("http://127.0.0.1:8000/skills/train/voice/");
    url.searchParams.append("user_id", "12345"); // Replace with actual user ID

    try {
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Error submitting voice response:", error);
      setFeedback("Error: Could not process your voice response.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format feedback
  const formatFeedback = (feedback) => {
    if (typeof feedback === 'string') {
      return feedback;
    }
    
    if (feedback.detail) {
      return feedback.detail;
    }
    
    return JSON.stringify(feedback, null, 2);
  };

  return (
    <div className="flex h-screen">
      {/* Left Side: Training Modules */}
      <div className="w-1/2 bg-gray-100 p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8">Training Modules</h1>
        
        <div className="space-y-6 w-full max-w-lg">
          {modules.map((module) => (
            <button
              key={module.id}
              className={`w-full px-8 py-6 text-2xl font-semibold border rounded-lg transition-all duration-300 ${
                selectedModule?.id === module.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => handleModuleSelect(module)}
            >
              {module.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: Prompt and Input */}
      <div className="w-1/2 bg-white p-8 flex flex-col items-center justify-center">
        {selectedModule && (
          <div className="w-full max-w-2xl">
            <h2 className="text-3xl font-bold mb-6">Prompt:</h2>
            <p className="mb-8 p-6 bg-gray-100 rounded-lg text-2xl">{selectedModule.prompt}</p>
            
            <textarea
              className="w-full p-6 border rounded-lg mb-6 text-xl resize-none"
              placeholder="Type your response here..."
              value={userInput}
              onChange={handleInputChange}
              disabled={isLoading || isRecording}
              rows={8}
            ></textarea>
            
            {audioUrl && (
              <div className="mb-6 w-full">
                <p className="text-center mb-4 text-xl">Audio Preview:</p>
                <audio controls className="w-full" src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            <div className="flex space-x-6">
              <button
                className={`flex-1 px-8 py-4 text-2xl font-semibold rounded-lg transition-all duration-300 ${
                  isLoading || isRecording || !userInput.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
                onClick={handleSubmit}
                disabled={isLoading || isRecording || !userInput.trim()}
              >
                {isLoading ? "Processing..." : "Submit Text"}
              </button>
              
              <button
                className={`flex-1 px-8 py-4 text-2xl font-semibold rounded-lg transition-all duration-300 ${
                  isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : isRecording
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={handleVoiceInput}
                disabled={isLoading}
              >
                {isRecording ? "Recording..." : "🎤 Record Audio"}
              </button>
            </div>
            
            {feedback && (
              <div className="mt-8 p-6 bg-green-100 rounded-lg w-full text-center">
                <p className="text-2xl font-medium">{formatFeedback(feedback)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingApp;