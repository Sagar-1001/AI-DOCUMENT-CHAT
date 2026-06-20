import { useEffect, useRef } from 'react';

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="chat-empty">
        <p>🤖 Ask anything about this document</p>
        <span>Your conversation will appear here</span>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((msg) => (
        <div key={msg._id} className="message-pair">

          {/* User Question */}
          <div className="message user-message">
            <div className="msg-bubble user-bubble">
              {msg.question}
            </div>
            <div className="msg-avatar">👤</div>
          </div>

          {/* AI Answer */}
          <div className="message ai-message">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble ai-bubble">
              {msg.answer.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </div>
          </div>

        </div>
      ))}

      {/* Typing indicator while waiting for answer */}
      {loading && (
        <div className="message ai-message">
          <div className="msg-avatar">🤖</div>
          <div className="msg-bubble ai-bubble typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}