import React, { memo, Suspense, useState, useCallback, useMemo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Box,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  TextField,
  InputAdornment
} from "@mui/material";
import { Code, ContentCopy, Http, CheckCircleOutline, Search, Clear } from "@mui/icons-material";

const Editor = React.lazy(() => import("@monaco-editor/react"));

const ResponseDisplay = memo(({ data, headers, latency, contentType }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState("body");
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  // Определение типа контента
  const detectedContentType = useMemo(() => {
    if (contentType?.includes("application/json")) return "json";
    if (contentType?.includes("application/xml")) return "xml";
    if (contentType?.includes("text/html")) return "html";
    return "text";
  }, [contentType]);

  // Форматирование содержимого
  const formattedContent = useMemo(() => {
    try {
      const input = viewMode === "body" ? data : headers;
      
      if (typeof input === "string") {
        if (detectedContentType === "json") {
          return JSON.stringify(JSON.parse(input), null, 2);
        }
        return input;
      }
      return JSON.stringify(input, null, 2);
    } catch (error) {
      return String(input);
    }
  }, [data, headers, viewMode, detectedContentType]);

  // Очистка подсветки
  const clearDecorations = useCallback(() => {
    if (editorRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, []);

  // Поиск и подсветка совпадений
  const highlightMatches = useCallback((term) => {
    if (!editorRef.current || !term) {
      clearDecorations();
      return;
    }

    const model = editorRef.current.getModel();
    const matches = model.findMatches(term, true, false, true, null, true);
    
    decorationsRef.current = model.deltaDecorations(
      decorationsRef.current,
      matches.map(match => ({
        range: match.range,
        options: {
          inlineClassName: 'search-match',
          stickiness: 1
        }
      }))
    );
  }, [clearDecorations]);

  // Обработчик изменения поискового запроса
  useEffect(() => {
    const handler = setTimeout(() => highlightMatches(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm, highlightMatches]);

  // Обновление при изменении контента
  useEffect(() => {
    highlightMatches(searchTerm);
  }, [formattedContent, highlightMatches, searchTerm]);

  // Инициализация редактора
  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.getAction("editor.action.formatDocument").run();
  }, []);

  // Копирование содержимого
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Ошибка копирования:", error);
    }
  }, [formattedContent]);

  // Параметры редактора
  const editorOptions = useMemo(() => ({
    readOnly: true,
    minimap: { enabled: false },
    lineNumbers: "off",
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace",
    renderValidationDecorations: "off",
    occurrencesHighlight: false,
    find: {
      addFindWidget: false // Отключаем стандартный поиск
    }
  }), []);

  return (
    <Paper elevation={3} sx={{
      mt: 2,
      p: 2,
      borderRadius: "8px",
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    }}>
      <Box display="flex" gap={2} mb={2} alignItems="center">
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          label="Поиск в ответе"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchTerm("");
                    clearDecorations();
                  }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ flex: 1 }}
        />

        <Tooltip title={copied ? "Скопировано!" : "Копировать в буфер"}>
          <IconButton onClick={handleCopy} size="small">
            {copied ? (
              <CheckCircleOutline color="success" fontSize="small" />
            ) : (
              <ContentCopy fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {latency && (
          <Chip
            label={`${latency}ms`}
            size="small"
            variant="outlined"
            sx={{ ml: "auto" }}
          />
        )}
      </Box>

      <Tabs
        value={viewMode}
        onChange={(_, v) => setViewMode(v)}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label="Тело"
          value="body"
          icon={<Code fontSize="small" />}
          sx={{ minHeight: 48, textTransform: "none" }}
        />
        <Tab
          label="Заголовки"
          value="headers"
          icon={<Http fontSize="small" />}
          sx={{ minHeight: 48, textTransform: "none" }}
        />
      </Tabs>

      <Box sx={{ height: "400px", mt: 2, position: "relative" }}>
        <Suspense fallback={
          <Box height="100%" display="flex" alignItems="center" justifyContent="center">
            <CircularProgress size={32} thickness={4} />
          </Box>
        }>
          <Editor
            height="100%"
            language={detectedContentType}
            value={formattedContent}
            theme={theme.palette.mode === "dark" ? "vs-dark" : "light"}
            onMount={handleEditorMount}
            options={editorOptions}
          />
        </Suspense>
      </Box>

      <style>
        {`
          .search-match {
            background-color: ${theme.palette.warning.light}80;
            border: 1px solid ${theme.palette.warning.main};
            border-radius: 2px;
          }
          .monaco-editor .find-widget {
            display: none !important;
          }
        `}
      </style>
    </Paper>
  );
});

ResponseDisplay.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  headers: PropTypes.object,
  latency: PropTypes.number,
  contentType: PropTypes.string
};

ResponseDisplay.defaultProps = {
  data: {},
  headers: {},
  contentType: "application/json"
};

export default ResponseDisplay;