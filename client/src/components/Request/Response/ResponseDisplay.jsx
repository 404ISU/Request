import React, { memo, Suspense, useState, useCallback } from 'react';
import { 
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  styled
} from '@mui/material';
import { Code, ContentCopy, Http, Timer, CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

const Editor = React.lazy(() => import('@monaco-editor/react'));

const ResponseDisplay = memo(({ data, status, headers, latency }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('body');
  const [copied, setCopied] = useState(false);
  const [formattedContent, setFormattedContent] = useState('');

  const formatJSON = useCallback((input) => {
    try {
      if (typeof input === 'string') {
        input = JSON.parse(input);
      }
      return JSON.stringify(input, null, 2);
    } catch (error) {
      try {
        return JSON.stringify(JSON.parse(JSON.stringify(input)), null, 2);
      } catch {
        return typeof input === 'string' ? input : String(input);
      }
    }
  }, []);

  const handleEditorMount = useCallback((editor) => {
    setTimeout(() => {
      editor.getAction('editor.action.formatDocument').run();
    }, 100);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper elevation={3} sx={{ 
      mt: 2,
      p: 2,
      borderRadius: '8px',
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper
    }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Chip 
          label={`Status: ${status}`}
          color={status >= 400 ? 'error' : 'success'}
          icon={status >= 400 ? <ErrorOutline /> : <CheckCircleOutline />}
        />
        <Typography variant="body2" color="text.secondary">
          <Timer fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          {latency}ms
        </Typography>
        
        <Tooltip title={copied ? "Copied!" : "Copy response"}>
          <IconButton onClick={handleCopy} size="small" sx={{ ml: 'auto' }}>
            {copied ? <CheckCircleOutline color="success" /> : <ContentCopy />}
          </IconButton>
        </Tooltip>
      </Box>

      <Tabs 
        value={viewMode} 
        onChange={(_, v) => setViewMode(v)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab 
          label="Body" 
          value="body" 
          icon={<Code fontSize="small" />}
          sx={{ minHeight: 48, textTransform: 'none' }}
        />
        <Tab 
          label="Headers" 
          value="headers" 
          icon={<Http fontSize="small" />}
          sx={{ minHeight: 48, textTransform: 'none' }}
        />
      </Tabs>

      <Box sx={{ height: '400px', mt: 2, position: 'relative' }}>
        <Suspense fallback={
          <Box height="100%" display="flex" alignItems="center" justifyContent="center">
            <CircularProgress size={32} thickness={4} />
          </Box>
        }>
          <Editor
            height="100%"
            language="json"
            value={formatJSON(viewMode === 'body' ? data : headers)}
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
            onMount={handleEditorMount}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              renderValidationDecorations: 'off',
              quickSuggestions: false,
              suggestOnTriggerCharacters: false,
              fontSize: 14,
              fontFamily: 'Menlo, Monaco, Consolas, monospace'
            }}
          />
        </Suspense>
      </Box>
    </Paper>
  );
});

export default ResponseDisplay;