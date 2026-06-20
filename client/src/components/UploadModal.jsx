import { useState, useRef } from 'react';
import { uploadDocument } from '../services/api';

export default function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are allowed.');
      return;
    }
    setErrorMsg('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const res = await uploadDocument(formData);
      setStatus('success');
      setTimeout(() => {
        onUploaded(res.data.document);
        onClose();
      }, 800);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Upload failed. Try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload PDF</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {file ? (
            <>
              <p className="drop-filename">✅ {file.name}</p>
              <span className="drop-hint">Click to choose a different file</span>
            </>
          ) : (
            <>
              <p className="drop-label">📂 Drag & drop your PDF here</p>
              <span className="drop-hint">or click to browse</span>
            </>
          )}
        </div>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <button
          className={`submit-btn ${status}`}
          onClick={handleSubmit}
          disabled={!file || status === 'uploading' || status === 'success'}
        >
          {status === 'idle' && 'Upload Document'}
          {status === 'uploading' && 'Uploading...'}
          {status === 'success' && 'Uploaded! ✓'}
          {status === 'error' && 'Try Again'}
        </button>
      </div>
    </div>
  );
}