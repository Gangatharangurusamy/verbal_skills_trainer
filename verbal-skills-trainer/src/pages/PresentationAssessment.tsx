import React, { useState, useRef } from "react";

const PresentationAssessment = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [speechText, setSpeechText] = useState("");
  const [speechRate, setSpeechRate] = useState(0);
  const [rawAIResponse, setRawAIResponse] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({
    structure: "",
    delivery: "",
    content: "",
    scores: { structure: 0, delivery: 0, content: 0 }
  });
  
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current.classList.add("drag-active");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current.classList.remove("drag-active");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current.classList.remove("drag-active");
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");
    
    // Check if file is an audio file
    if (!selectedFile.type.startsWith("audio/")) {
      setError("Please select an audio file (MP3, WAV, etc.)");
      return;
    }
    
    // Check file size (limit to 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size too large. Please select a file under 50MB.");
      return;
    }
    
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an audio file.");
      return;
    }
  
    setIsLoading(true);
    setUploadProgress(0);
    setError("");
  
    const formData = new FormData();
    formData.append("file", file);
    
    // Assuming you have a user ID stored somewhere (replace "your_user_id" with actual ID)
    const userId = "your_user_id";
    
    try {
      // Using XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.onload = async function() {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log("Backend Response:", data);
          
          // Update state with backend response
          setSpeechText(data.speech_text);
          setSpeechRate(data.speech_rate);
          setAudioUrl(`http://127.0.0.1:8000/${data.audio_file}`);
          setRawAIResponse(data.ai_feedback);
          
          // Parse AI feedback into structure, delivery, and content
          const parsedFeedback = parseAIFeedback(data.ai_feedback, data.speech_rate);
          setFeedback(parsedFeedback);
        } else {
          throw new Error(`HTTP error! Status: ${xhr.status}`);
        }
        setIsLoading(false);
      };
      
      xhr.onerror = function() {
        setError("Network error occurred while uploading");
        setIsLoading(false);
      };
      
      xhr.open("POST", `http://127.0.0.1:8000/presentation/assess/?user_id=${userId}`);
      xhr.send(formData);
      
    } catch (error) {
      console.error("Error submitting file:", error);
      setError(`Error: ${error.message}`);
      setFeedback({
        structure: "",
        delivery: "",
        content: "",
        scores: { structure: 0, delivery: 0, content: 0 }
      });
      setIsLoading(false);
    }
  };

  // Function to parse AI feedback into categories
  const parseAIFeedback = (feedbackText, rate) => {
    // In a real app, you'd implement proper parsing of the AI response
    // This is a placeholder implementation
    return {
      structure: "The introduction is clear, but the conclusion could be stronger.",
      delivery: `Pacing is good at ${rate} words per minute, but there are some filler words.`,
      content: "Persuasive arguments are present, but vocabulary could be more varied.",
      scores: { structure: 7, delivery: 6, content: 8 }
    };
  };

  // Simple progress bar component
  const ProgressBar = ({ value }) => (
    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px', height: '8px', marginBottom: '8px' }}>
      <div style={{ width: `${value}%`, backgroundColor: '#3b82f6', borderRadius: '4px', height: '8px' }}></div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Presentation Assessment</h1>
      
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: '16px', backgroundColor: '#fff' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Submit Your Presentation</h2>
        
        {/* Drag and drop area */}
        <div 
          ref={dropAreaRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ 
            border: '2px dashed #d1d5db', 
            borderRadius: '6px', 
            padding: '32px', 
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => fileInputRef.current.click()}
          className="drop-area"
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            disabled={isLoading}
          />
          
          <div style={{ marginBottom: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', color: '#6b7280' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          
          <p style={{ fontSize: '16px', fontWeight: 'medium', color: '#4b5563', marginBottom: '4px' }}>
            {file ? `Selected: ${file.name}` : 'Drag and drop your audio file here'}
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>or click to browse</p>
          
          {file && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
              {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
            </div>
          )}
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => fileInputRef.current.click()}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#f9fafb',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              flexGrow: 1
            }}
            disabled={isLoading}
          >
            Upload Audio
          </button>
          
          <button style={{ 
            padding: '8px 16px',
            backgroundColor: '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            flexGrow: 1
          }}
          disabled={isLoading}
          >
            Record Audio
          </button>
        </div>
      </div>
      
      <button 
        onClick={handleSubmit}
        disabled={isLoading || !file}
        style={{ 
          width: '100%',
          padding: '12px 16px',
          backgroundColor: isLoading || !file ? '#d1d5db' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || !file ? 'not-allowed' : 'pointer',
          marginBottom: '16px',
          fontWeight: 'medium',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {isLoading ? (
          <>
            <span>Analyzing...</span>
            <span>{uploadProgress}%</span>
          </>
        ) : "Analyze Presentation"}
      </button>
      
      {isLoading && (
        <div style={{ marginBottom: '16px' }}>
          <ProgressBar value={uploadProgress} />
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            {uploadProgress < 100 ? 'Uploading...' : 'Processing your audio...'}
          </p>
        </div>
      )}
      
      {speechText && (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: '16px', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Speech Transcript</h2>
          <p style={{ color: '#333' }}>{speechText}</p>
        </div>
      )}
      
      {rawAIResponse && (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: '16px', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>AI Feedback (Raw)</h2>
          <p style={{ color: '#333', whiteSpace: 'pre-wrap' }}>{rawAIResponse}</p>
        </div>
      )}
      
      {(feedback.structure || feedback.delivery || feedback.content) && (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Evaluation Report</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Structure</h3>
            <ProgressBar value={feedback.scores.structure * 10} />
            <p style={{ fontSize: '14px', color: '#333' }}>{feedback.structure}</p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Delivery</h3>
            <ProgressBar value={feedback.scores.delivery * 10} />
            <p style={{ fontSize: '14px', color: '#333' }}>{feedback.delivery}</p>
          </div>
          
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Content</h3>
            <ProgressBar value={feedback.scores.content * 10} />
            <p style={{ fontSize: '14px', color: '#333' }}>{feedback.content}</p>
          </div>
        </div>
      )}
      
      {audioUrl && (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginTop: '16px', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>AI Feedback Audio</h2>
          <audio controls style={{ width: '100%' }} src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

// CSS to be included in your stylesheet
const styles = `
.drop-area.drag-active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
`;

export default PresentationAssessment;