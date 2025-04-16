import React from 'react';

const WoodyAiBanner = ({ 
    text = "Welcome to Swing Sync", 
    backgroundColor = "#4a90e2", 
    textColor = "black",
    height = "60px",
    onClose
}) => {
    return (
        <div 
            className="woody-ai-banner" 
            style={{ 
                backgroundColor, 
                color: textColor,
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                boxSizing: 'border-box'
            }}
        >
            {/* Banner Text */}
            <div style={{                 
                fontSize: '1rem', 
                fontWeight: 'bold', 
                margin: '0 auto',
                flex: '1',
                textAlign: 'center' }}>
                {text}
            </div>

            {/* Right side controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <a 
                    href="/woody/chat" 
                    style={{ 
                        color: textColor, 
                        textDecoration: 'underline',
                        fontWeight: 'bold'
                    }}
                >
                    Go to Chat
                </a>
                {onClose && (
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: textColor
                        }}
                        aria-label="Close banner"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export default WoodyAiBanner;
