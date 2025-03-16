import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

interface DashboardData {
  totalSessions: number;
  clarityScore: number;
  fluencyScore: number;
  pronunciationScore: number;
  overallScore: number;
  feedback: string;
  latestRecording: string;
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000") // Replace with your API URL
      .then((response) => {
        // Enhance the API data with additional metrics if they don't exist
        const enhancedData = {
          ...response.data,
          // If these don't exist in your API, add default values
          overallScore: response.data.overallScore || 85,
        };
        setData(enhancedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="title">Speaking Skills Dashboard</h1>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb', 
        marginBottom: '20px' 
      }}>
        <button 
          style={{ 
            padding: '10px 20px', 
            fontWeight: 500, 
            color: activeTab === 'overview' ? '#2563eb' : '#6b7280',
            borderBottom: activeTab === 'overview' ? '2px solid #2563eb' : 'none'
          }}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          style={{ 
            padding: '10px 20px', 
            fontWeight: 500, 
            color: activeTab === 'analysis' ? '#2563eb' : '#6b7280',
            borderBottom: activeTab === 'analysis' ? '2px solid #2563eb' : 'none'
          }}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis Report
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Top Section: Cards */}
          <div className="card-container">
            <Link to="/chat" className="card">
              <h2>Chat Interface</h2>
              <p>Hello! How can I help you today?</p>
            </Link>
            <div className="card">
            <Link to="/voice" className="card">
              <h2>Voice Interface</h2>
              <p>Hello! How can I help you today?</p>
            </Link>
            </div>
            <div className="card">
            <Link to="/Skill" className="card">
              <h2>Skill Training</h2>
              <p>📚 Pronunciation Exercise</p>
            </Link>
            </div>
            <div className="card">
              <Link to="/presentation" className="card">
              <h2>Presentation Assessment</h2>
              <p>📊 Live Analysis: 87%</p>
              </Link>
            </div>
          </div>

          <h2 style={{ marginTop: '30px', marginBottom: '20px' }}>Overall Performance Score</h2>
          
          {/* Performance Metrics as Cards */}
          <div className="card-container">
            <div className="card">
              <h2>Total Sessions</h2>
              <p>{data?.totalSessions || "Loading..."}</p>
            </div>
            <div className="card">
              <h2>Average Clarity Score</h2>
              <p>{data?.clarityScore || "Loading..."}/10</p>
            </div>
            <div className="card">
              <h2>Average Fluency Score</h2>
              <p>{data?.fluencyScore || "Loading..."}/10</p>
            </div>
            <div className="card">
              <h2>Average Pronunciation Score</h2>
              <p>{data?.pronunciationScore || "Loading..."}/10</p>
            </div>
          </div>

          {/* AI Feedback Card */}
          <div className="card-container" style={{ marginTop: '20px' }}>
            <div className="card" style={{ width: '100%' }}>
              <h2>AI Feedback</h2>
              <p>{data?.feedback || "Loading feedback..."}</p>
            </div>
          </div>

          {/* Latest Recording Card */}
          <div className="card-container" style={{ marginTop: '20px' }}>
            <div className="card" style={{ width: '100%' }}>
              <h2>Latest Recording</h2>
              {data?.latestRecording ? (
                <audio controls style={{ marginTop: '10px', width: '100%' }}>
                  <source src={data.latestRecording} type="audio/mpeg" />
                  Your browser does not support the audio tag.
                </audio>
              ) : (
                <p>Loading recording...</p>
              )}
            </div>
          </div>
        </>
      ) : (
        // Analysis Report Tab Content
        <AnalysisReport data={data} />
      )}
    </div>
  );
}

// Analysis Report Component
const AnalysisReport: React.FC<{ data: DashboardData | null }> = ({ data }) => {
  // Default values for demonstration or when data is loading
  const {
    overallScore = 85,
    clarityScore = 90,
    fluencyScore,
    pronunciationScore,
    totalSessions,
    feedback,
    latestRecording = null
  } = data || {};

  const reportStyle = {
    container: {
      maxWidth: '800px',
      margin: '0 auto'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '24px'
    },
    overallScore: {
      backgroundColor: '#f1f1f1',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px'
    },
    scoreHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    scoreTitle: {
      fontSize: '18px',
      fontWeight: '500'
    },
    scoreValue: {
      fontSize: '20px',
      fontWeight: 'bold'
    },
    progressBar: {
      width: '100%',
      backgroundColor: '#d1d5db',
      borderRadius: '9999px',
      height: '8px'
    },
    progressFill: {
      backgroundColor: '#1f2937',
      height: '100%',
      borderRadius: '9999px'
    },
    scoreGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px',
      marginBottom: '24px'
    },
    scoreCard: {
      backgroundColor: '#f1f1f1',
      borderRadius: '8px',
      padding: '24px'
    },
    scoreCardTitle: {
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '8px',
      color: '#4b5563'
    },
    scoreCardValue: {
      fontSize: '32px',
      fontWeight: 'bold'
    },
    divider: {
      borderTop: '1px solid #e5e7eb',
      margin: '24px 0'
    },
    performanceSection: {
      marginTop: '24px'
    },
    metricsContainer: {
      backgroundColor: '#f1f1f1',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px'
    },
    metricItem: {
      marginBottom: '12px'
    }
  };

  return (
    <div style={reportStyle.container}>
      <h1 style={reportStyle.title}>Analysis Report</h1>
      
      {/* Overall Score */}
      <div style={reportStyle.overallScore}>
        <div style={reportStyle.scoreHeader}>
          <h2 style={reportStyle.scoreTitle}>Overall Score</h2>
          <span style={reportStyle.scoreValue}>{overallScore}/100</span>
        </div>
        <div style={reportStyle.progressBar}>
          <div 
            style={{
              ...reportStyle.progressFill,
              width: `${overallScore}%`
            }}
          ></div>
        </div>
      </div>
      
      {/* Score Grid */}
      <div style={reportStyle.scoreGrid}>
        {/* Clarity */}
        <div style={reportStyle.scoreCard}>
          <h3 style={reportStyle.scoreCardTitle}>Clarity</h3>
          <p style={reportStyle.scoreCardValue}>{clarityScore}%</p>
        </div>
        
        {/* Fluency */}
        <div style={reportStyle.scoreCard}>
          <h3 style={reportStyle.scoreCardTitle}>Average Fluency Score</h3>
          <p style={reportStyle.scoreCardValue}>{fluencyScore || "Loading..."}/10</p>
        </div>
        
        {/* Pronunciation */}
        <div style={reportStyle.scoreCard}>
          <h3 style={reportStyle.scoreCardTitle}>Average Pronunciation Score</h3>
          <p style={reportStyle.scoreCardValue}>{pronunciationScore || "Loading..."}/10</p>
        </div>
        
        {/* Total Sessions */}
        <div style={reportStyle.scoreCard}>
          <h3 style={reportStyle.scoreCardTitle}>Total Sessions</h3>
          <p style={reportStyle.scoreCardValue}>{totalSessions || "Loading..."}</p>
        </div>
      </div>
      
      {/* Divider line */}
      <div style={reportStyle.divider}></div>
      
      {/* Latest Recording (Audio Player) */}
      <div style={{
        backgroundColor: '#f1f1f1',  
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '500',
          marginBottom: '12px'
        }}>Latest Recording</h3>
        {latestRecording ? (
          <audio 
            controls 
            style={{
              width: '100%',
              marginTop: '12px'
            }}
          >
            <source src={latestRecording} type="audio/mpeg" />
            Your browser does not support the audio tag.
          </audio>
        ) : (
          <p>Loading recording...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;