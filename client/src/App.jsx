import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import UploadModal from './components/UploadModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { getAllDocuments, getChatHistory, askQuestion, getMe } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchDocs = async () => {
      try {
        const res = await getAllDocuments();
        setDocuments(res.data);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      }
    };
    fetchDocs();
  }, [user]);

  useEffect(() => {
    if (!selectedDoc) return;
    const fetchHistory = async () => {
      try {
        const res = await getChatHistory(selectedDoc._id);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, [selectedDoc]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDocuments([]);
    setSelectedDoc(null);
    setMessages([]);
  };

  const handleSelectDoc = (doc) => {
    if (selectedDoc?._id === doc._id) return;
    setSelectedDoc(doc);
    setMessages([]);
  };

  const handleDelete = (id) => {
    setDocuments((prev) => prev.filter((d) => d._id !== id));
    if (selectedDoc?._id === id) {
      setSelectedDoc(null);
      setMessages([]);
    }
  };

  const handleUploaded = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    setMessages([]);
  };

  const handleSend = async (question) => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      const res = await askQuestion(selectedDoc._id, question);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to get answer.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!user) {
    return authPage === 'login'
      ? <LoginPage onLogin={handleLogin} onGoToRegister={() => setAuthPage('register')} />
      : <RegisterPage onLogin={handleLogin} onGoToLogin={() => setAuthPage('login')} />;
  }

  return (
    <div className="app-layout">
      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
        <Sidebar
          documents={documents}
          selectedDoc={selectedDoc}
          onSelect={handleSelectDoc}
          onDelete={handleDelete}
          onUploadClick={() => setShowModal(true)}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {!sidebarOpen && (
        <button className="sidebar-open-btn" onClick={() => setSidebarOpen(true)}>☰</button>
      )}

      <main className="main-panel">
        {selectedDoc ? (
          <>
            <div className="chat-header">
              <span>📄 {selectedDoc.originalName}</span>
            </div>
            <ChatWindow messages={messages} loading={loading} />
            <ChatInput onSend={handleSend} disabled={loading} />
          </>
        ) : (
          <div className="welcome-screen">
            <h1>📄 Chat with your PDFs</h1>
            <p>Upload a document from the sidebar and start asking questions.</p>
            <button className="welcome-upload-btn" onClick={() => setShowModal(true)}>
              Upload your first PDF
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onUploaded={handleUploaded} />
      )}
    </div>
  );
}