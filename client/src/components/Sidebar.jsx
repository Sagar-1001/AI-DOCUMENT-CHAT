import { useState, useRef, useEffect } from 'react';
import { deleteDocument } from '../services/api';

export default function Sidebar({ documents, selectedDoc, onSelect, onDelete, onUploadClick, onClose, user, onLogout }) {
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      onDelete(id);
    } catch (err) {
      alert('Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Get initials for the avatar (e.g. "Sagar Singh" -> "SS")
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-top-row">
          <h1 className="logo">📄 AskMyDoc</h1>

          <div className="sidebar-top-actions">
            {/* User avatar + dropdown menu, top-right corner */}
            <div className="user-menu" ref={menuRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setMenuOpen((prev) => !prev)}
                title={user?.name}
              >
                {getInitials(user?.name)}
              </button>

              {menuOpen && (
                <div className="user-dropdown">
                  <p className="user-dropdown-name">{user?.name}</p>
                  <p className="user-dropdown-email">{user?.email}</p>
                  <hr className="user-dropdown-divider" />
                  <button
                    className="user-dropdown-logout"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button className="sidebar-close-btn" onClick={onClose} title="Close sidebar">✕</button>
          </div>
        </div>

        <button className="upload-btn" onClick={onUploadClick}>+ Upload PDF</button>
      </div>

      <p className="section-label">YOUR DOCUMENTS</p>

      <div className="doc-list">
        {documents.length === 0 && (
          <div className="empty-sidebar">
            <p>No documents yet</p>
            <span>Upload a PDF to get started</span>
          </div>
        )}
        {documents.map((doc) => (
          <div
            key={doc._id}
            className={`doc-item ${selectedDoc?._id === doc._id ? 'active' : ''}`}
            onClick={() => onSelect(doc)}
          >
            <div className="doc-info">
              <p className="doc-name">{doc.originalName}</p>
              <span className="doc-date">{formatDate(doc.createdAt)}</span>
            </div>
            <button
              className="delete-btn"
              onClick={(e) => handleDelete(e, doc._id)}
              disabled={deletingId === doc._id}
            >
              {deletingId === doc._id ? '...' : '🗑'}
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}