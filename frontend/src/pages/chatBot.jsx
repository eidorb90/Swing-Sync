import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Link, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      { 
        role: 'assistant', 
        content: "Hi! I'm Woody.Ai, your golf assistant. Ask me anything about your golf swing or game!" 
      }
    ]);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setLoading(true);
    
    try {
      // Send to backend
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      // Add assistant response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || String(data)
      }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  // Custom renderer for markdown code blocks
  const components = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={docco}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, height: '90vh' }}>
      <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: '#4caf50' }}>🏌️</Avatar>
            <Typography variant="h4" component="h1">Woody.Ai</Typography>
          </Box>
          <Link href="/account" underline="hover">Back to Account</Link>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                maxWidth: '80%',
                bgcolor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                boxShadow: 1,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  [msg.role === 'user' ? 'right' : 'left']: -10,
                  borderWidth: '10px 10px 0',
                  borderStyle: 'solid',
                  borderColor: `${msg.role === 'user' ? '#e3f2fd' : '#f5f5f5'} transparent transparent`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    mr: 1, 
                    bgcolor: msg.role === 'user' ? '#1976d2' : '#4caf50',
                    fontSize: '0.875rem'
                  }}
                >
                  {msg.role === 'user' ? '👤' : '🏌️'}
                </Avatar>
                <Typography variant="subtitle2">
                  {msg.role === 'user' ? 'You' : 'Woody.Ai'}
                </Typography>
              </Box>
              
              <Box sx={{ pl: 4 }}>
                <ReactMarkdown components={components}>
                  {msg.content}
                </ReactMarkdown>
              </Box>
            </Box>
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, maxWidth: '80%' }}>
              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: '#4caf50', fontSize: '0.875rem' }}>
                🏌️
              </Avatar>
              <Typography variant="subtitle2" sx={{ mr: 2 }}>Woody.Ai</Typography>
              <CircularProgress size={20} />
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', px: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about your golf swing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={loading}
            multiline
            maxRows={3}
            sx={{ mr: 1 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            endIcon={<SendIcon />}
            sx={{ minWidth: 100 }}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatBot;