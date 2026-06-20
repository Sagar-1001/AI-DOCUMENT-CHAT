import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [question, setQuestion] = useState('');

  const handleSend = () => {
    const q = question.trim();
    if (!q || disabled) return;
    onSend(q);
    setQuestion('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-textarea"
        placeholder="Ask a question about this document..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!question.trim() || disabled}
      >
        Send ➤
      </button>
    </div>
  );
}