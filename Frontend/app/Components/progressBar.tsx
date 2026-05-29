import { useState, useEffect, useRef } from 'react';

export default function ProgressBar({ messages }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getDisplayMessages = () => {
    return isExpanded ? messages : messages.slice(-5);
  };
  
  const displayMessages = getDisplayMessages();

  return (
    <div className='progressBar'>
      <div onClick={() => setIsExpanded(!isExpanded)} className='progressBarHeader'>
        <span>📡↔️ Alerts ({messages.length})</span>
        <span>{isExpanded ? '▼' : '▲'}</span>
      </div>

      {isExpanded ? (
        <div className='expandedView'>
          {displayMessages.length === 0 ? (
            <div className='emptyMessage'>No messages yet</div>
          ) : (
            displayMessages.map((msg, index) => (
              <div key={index}>
                <div className='messageItem'>
                  {msg.data && <div>{msg.data.progress}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className='collapsedView'>
          📡↔️ Alerts {messages.length} message{messages.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}