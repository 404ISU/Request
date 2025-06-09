import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Box, Tabs, Tab, Chip, ButtonGroup, Button, Tooltip, ToggleButton, TextField, InputAdornment, Alert, Typography } from '@mui/material';
import { Code, FormatAlignLeft, WrapText, Search, ContentCopy, Error as ErrorIcon } from '@mui/icons-material';
import Editor from '@monaco-editor/react';

const ResponseDisplay = ({ data, headers, status, latency, error }) => {
  const [activeTab, setActiveTab] = useState('body');
  const [viewMode, setViewMode] = useState('pretty');
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeMatch, setActiveMatch] = useState(0);
  const editorRef = useRef(null);
  const decorations = useRef([]);

  // Стили подсветки поиска
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .search-highlight {
        background-color: #ffd70080 !important;
        border-radius: 3px;
        transition: background-color 0.3s;
      }
      .search-highlight.current-match {
        background-color: #ffae00 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Форматирование данных
  const formattedData = useMemo(() => {
    try {
      let content;
      if (activeTab === 'body') {
        // Если данные пришли как часть объекта response
        if (data && typeof data === 'object' && 'data' in data) {
          content = data.data;
        } else if (typeof data === 'string') {
          try {
            content = JSON.parse(data);
          } catch {
            content = data;
          }
        } else {
          content = data;
        }
      } else {
        // Нормализуем заголовки для отображения
        content = headers ? Object.fromEntries(
          Object.entries(headers).sort(([a], [b]) => a.localeCompare(b))
        ) : {};
      }
      
      if (viewMode === 'pretty') {
        if (typeof content === 'string') {
          try {
            return JSON.stringify(JSON.parse(content), null, 2);
          } catch {
            return content;
          }
        }
        return JSON.stringify(content, null, 2);
      }

      if (typeof content === 'string') {
        try {
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed)
            .replace(/},/g, '},\n')
            .replace(/\],/g, '],\n')
            .replace(/},\n}/g, '}}')
            .replace(/\],\n\]/g, ']]');
        } catch {
          return content;
        }
      }

      return JSON.stringify(content);
    } catch (err) {
      console.error('Error formatting data:', err);
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  }, [data, headers, activeTab, viewMode]);

  // Обработка копирования
  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Настройки редактора
  const editorOptions = useMemo(() => ({
    readOnly: true,
    minimap: { enabled: false },
    lineNumbers: viewMode === 'pretty' ? 'on' : 'off',
    scrollBeyondLastLine: false,
    wordWrap: wordWrap ? 'on' : 'off',
    fontSize: 14,
    fontFamily: "'Fira Code', monospace",
    renderWhitespace: 'none',
    automaticLayout: true,
    scrollbar: {
      vertical: 'auto',
      horizontal: wordWrap ? 'hidden' : 'auto'
    },
  }), [viewMode, wordWrap]);

  // Монтирование редактора
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  // Поиск совпадений
  const handleSearch = (text) => {
    setSearchText(text);
    if (!editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    editorRef.current.deltaDecorations(decorations.current, []);
    setSearchResults([]);
    setActiveMatch(0);

    if (!text) return;

    const matches = model.findMatches(text, true, false, true, null, true);
    setSearchResults(matches);

    if (matches.length === 0) return;

    const newDecorations = matches.map((match, index) => ({
      range: match.range,
      options: {
        inlineClassName: index === 0 ? 'search-highlight current-match' : 'search-highlight',
        overviewRuler: {
          color: index === 0 ? '#ffae00' : '#ffd70080',
          position: 4
        }
      }
    }));

    decorations.current = editorRef.current.deltaDecorations([], newDecorations);
    setActiveMatch(0);
    editorRef.current.revealRangeInCenter(matches[0].range);
  };

  // Навигация по совпадениям
  const handleNextMatch = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (activeMatch + 1) % searchResults.length;
    updateActiveMatch(nextIndex);
  };

  const handlePrevMatch = () => {
    if (searchResults.length === 0) return;
    const prevIndex = (activeMatch - 1 + searchResults.length) % searchResults.length;
    updateActiveMatch(prevIndex);
  };

  const updateActiveMatch = (index) => {
    const editor = editorRef.current;
    if (!editor) return;

    const newDecorations = searchResults.map((match, i) => ({
      range: match.range,
      options: {
        inlineClassName: i === index ? 'search-highlight current-match' : 'search-highlight',
        overviewRuler: {
          color: i === index ? '#ffae00' : '#ffd70080',
          position: 4
        }
      }
    }));

    decorations.current = editor.deltaDecorations(decorations.current, newDecorations);
    setActiveMatch(index);
    editor.revealRangeInCenter(searchResults[index].range);
  };

  // Сброс поиска при изменении данных
  useEffect(() => {
    setSearchText('');
    setSearchResults([]);
    setActiveMatch(0);
    if (editorRef.current) {
      editorRef.current.deltaDecorations(decorations.current, []);
    }
  }, [formattedData]);

  return (
    <Box sx={{ 
      border: '1px solid #ddd', 
      borderRadius: 2, 
      p: 2,
      bgcolor: 'background.paper'
    }}>
      {error && (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ mb: 2 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle2">{error.message}</Typography>
            {error.code && (
              <Typography variant="caption" color="error">
                Код ошибки: {error.code}
              </Typography>
            )}
            {error.details && (
              <Typography variant="caption" color="error">
                Детали: {JSON.stringify(error.details)}
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Tabs 
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ minHeight: 40 }}
        >
          <Tab 
            label="Body" 
            value="body" 
            icon={<Code fontSize="small" />}
            sx={{ minHeight: 40, textTransform: 'none' }}
          />
          <Tab 
            label="Headers" 
            value="headers" 
            icon={<FormatAlignLeft fontSize="small" />}
            sx={{ minHeight: 40, textTransform: 'none' }}
          />
        </Tabs>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: 'wrap',
          '@media (max-width: 600px)': {
            width: '100%',
            justifyContent: 'space-between'
          }
        }}>
          <ButtonGroup size="small">
            <Button
              variant={viewMode === 'pretty' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('pretty')}
            >
              Pretty
            </Button>
            <Button
              variant={viewMode === 'raw' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('raw')}
            >
              Raw
            </Button>
          </ButtonGroup>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            flexGrow: 1,
            maxWidth: '100%',
            '@media (max-width: 600px)': {
              width: '100%',
              mt: 1
            }
          }}>
            <TextField
              size="small"
              placeholder="Поиск..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
              }}
              sx={{ 
                width: { xs: '100%', sm: 250 },
                minWidth: 150,
                flexGrow: 1
              }}
            />

            <ButtonGroup size="small" disabled={searchResults.length === 0}>
              <Button onClick={handlePrevMatch} disabled={searchResults.length === 0}>
                ←
              </Button>
              <Chip 
                label={`${activeMatch + 1}/${searchResults.length}`}
                size="small"
                sx={{ mx: 1 }}
              />
              <Button onClick={handleNextMatch} disabled={searchResults.length === 0}>
                →
              </Button>
            </ButtonGroup>
          </Box>

          <Tooltip title={`${wordWrap ? 'Выключить' : 'Включить'} перенос строк`}>
            <ToggleButton
              size="small"
              value={wordWrap}
              onChange={() => setWordWrap(!wordWrap)}
              sx={{ 
                border: '1px solid #ccc',
                bgcolor: wordWrap ? 'primary.light' : 'background.paper'
              }}
            >
              <WrapText fontSize="small" />
            </ToggleButton>
          </Tooltip>

          {latency && (
            <Chip 
              label={`${latency}ms`} 
              size="small" 
              color="info"
            />
          )}

          <Tooltip title={copied ? "Скопировано!" : "Скопировать в буфер обмена"}>
            <Chip
              clickable
              icon={<ContentCopy fontSize="small" />}
              onClick={handleCopy}
              color={copied ? 'success' : 'default'}
              sx={{
                minWidth: 40,
                '& .MuiChip-icon': {
                  marginRight: 0
                }
              }}
            />
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ 
        height: 400,
        border: '1px solid #eee',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Editor
          height="100%"
          language={viewMode === 'raw' ? 'json' : 'json'}
          theme="light"
          value={formattedData}
          options={editorOptions}
          onMount={handleEditorMount}
        />
      </Box>
    </Box>
  );
};

export default ResponseDisplay;