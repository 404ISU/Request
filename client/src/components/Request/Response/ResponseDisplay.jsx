import React, { useState, useCallback } from 'react';
import { 
  Paper, 
  Typography, 
  IconButton, 
  Tooltip,
  Collapse,
  Fade,
  useTheme,
  Tabs,
  Tab,
  TextField,
  Chip,
  Box,
  Stack
} from '@mui/material';
import { 
  ContentCopy, 
  ExpandMore, 
  ExpandLess, 
  CheckCircle, 
  ErrorOutline,
  Download,
  Search,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { saveAs } from 'file-saver';
import copy from 'clipboard-copy';

const ResponseDisplay = ({ 
  response, 
  latency, 
  headers = {},
  status,
  errorChecker
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const isError = errorChecker ? errorChecker(response) 
    : status >= 400 || response?.error;

  const responseContent = typeof response === 'object' 
    ? JSON.stringify(response, null, 2) 
    : response;

  const handleCopy = useCallback(() => {
    copy(responseContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [responseContent]);

  const handleDownload = () => {
    const blob = new Blob([responseContent], { type: 'application/json' });
    saveAs(blob, 'response.json');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredContent = useCallback(() => {
    if (!searchQuery) return responseContent;
    try {
      const json = JSON.parse(responseContent);
      const searchLower = searchQuery.toLowerCase();
      
      const filter = (obj) => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const nested = filter(value);
            if (Object.keys(nested).length > 0) {
              acc[key] = nested;
            }
          } else if (
            key.toLowerCase().includes(searchLower) ||
            String(value).toLowerCase().includes(searchLower)
          ) {
            acc[key] = value;
          }
          return acc;
        }, {});
      };

      return JSON.stringify(filter(json), null, 2);
    } catch {
      return responseContent;
    }
  }, [responseContent, searchQuery]);

  const syntaxTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'light';
  const statusColor = isError ? 'error.main' : 'success.main';

  const renderHeaders = () => (
    <Box sx={{ mt: 2 }}>
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Chip label={key} size="small" variant="outlined" />
          <Typography variant="body2">{value}</Typography>
        </div>
      ))}
    </Box>
  );

  return (
    <Fade in={true} timeout={500}>
      <Paper elevation={3} sx={{ 
        p: 2, 
        mb: 3, 
        backgroundColor: 'background.paper',
        borderLeft: `4px solid ${theme.palette[isError ? 'error' : 'success'].main}`
      }}>
        <Stack spacing={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isError ? (
              <ErrorOutline color="error" fontSize="medium" />
            ) : (
              <CheckCircle color="success" fontSize="medium" />
            )}
            
            <Typography variant="h6" sx={{ 
              color: statusColor,
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              Ответ {status && `- ${status} ${httpStatusText(status)}`}
              <Chip 
                label={`${latency}ms`} 
                size="small" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Typography>

            <Stack direction="row" spacing={1}>
              <Tooltip title={copied ? 'Скопировано!' : 'Копировать'}>
                <IconButton onClick={handleCopy} size="small">
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Скачать JSON">
                <IconButton onClick={handleDownload} size="small">
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={expanded ? 'Свернуть' : 'Развернуть'}>
                <IconButton onClick={() => setExpanded(!expanded)} size="small">
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Tooltip>
            </Stack>
          </div>

          <Collapse in={expanded}>
            <Tabs
              value={tabIndex}
              onChange={(e, newValue) => setTabIndex(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="JSON" />
              <Tab label="Headers" />
            </Tabs>

            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Поиск в ответе..."
              InputProps={{
                startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />
              }}
              onChange={handleSearch}
              sx={{ mb: 2 }}
            />

            {tabIndex === 0 ? (
              <Editor
                height="400px"
                language="json"
                value={filteredContent()}
                theme={syntaxTheme}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  folding: true,
                  renderLineHighlight: 'none'
                }}
              />
            ) : (
              renderHeaders()
            )}
          </Collapse>
        </Stack>
      </Paper>
    </Fade>
  );
};

const httpStatusText = (status) => {
  const statusMap = {
    200: 'OK',
    201: 'Created',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  };
  return statusMap[status] || '';
};

export default ResponseDisplay;