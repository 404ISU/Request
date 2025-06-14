// src/components/RequestForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Stack,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  TextField,
  Box,
  Menu,
  Portal,
  Pagination,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  SendRounded,
  HistoryRounded,
  SettingsRounded,
  CodeRounded,
  ReplayRounded,
  ExpandMoreRounded,
  CollectionsBookmark,
  Add,
  WifiTetheringRounded,
  BugReportRounded,
  AssessmentRounded,
  SecurityRounded,
  LinkRounded,
  StorageRounded,
  CheckCircleRounded,
  CheckCircle,
  Cancel,
  Info
} from '@mui/icons-material';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import axios from 'axios';
import { CollectionTree } from './Collections/CollectionTree';
import ApiInput from './Api/ApiInput';
import AssertionsInput from './Api/AssertionsInput';
import MethodSelector from './Api/MethodSelector';
import HeadersInput from './Api/HeadersInput';
import BodyInput from './Api/BodyInput';
import ResponseDisplay from './Response/ResponseDisplay';
import QueryParamsInput from './Api/QueryParamsInput';
import EnvironmentVariables from './Api/EnvironmentVariables';
import AuthInput from './Api/AuthInput';
import WebSocketClient from './webSocket/WebSocketClient';
import TestsTab from './Tests/TestsTab';
import LoadTestTab from './Tests/Load/LoadTestTab';

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: theme.shadows[2],
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const AnimatedButton = styled(Button)({
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
});

export default function RequestForm() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // === Состояния ===
  const [activeTab, setActiveTab] = useState(0);
  const [requestState, setRequestState] = useState({
    method: 'GET',
    url: '',
    headers: '{}',
    body: '',
    queryParams: '{}',
    collectionId: null,
    itemId: null
  });
  const [collectionsMenu, setCollectionsMenu] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  const [assertions, setAssertions] = useState([]);             
  const [assertionResults, setAssertionResults] = useState([]); 
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);              
  const [requestHistory, setRequestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [queryParams, setQueryParams] = useState('{}');
  const [auth, setAuth] = useState({ type: 'none', token: '' });
  const [envVars, setEnvVars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    request: true,
    advanced: false
  });
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState('request');
  const [newItemName, setNewItemName] = useState('');
  const [history, setHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage] = useState(10);
  const [advancedSettingsTab, setAdvancedSettingsTab] = useState(0);

  // === Загрузка истории запросов ===
  useEffect(() => {
    fetchRequestHistory();
  }, []);

  const fetchRequestHistory = async () => {
    setLoadingHistory(true);
    try {
      const resp = await axios.get('/api/requests/history', {
        withCredentials: true
      });
      const parsedRequests = resp.data.map(parseServerRequest);
      setHistory(parsedRequests);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load request history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // === Утилиты для парсинга ===
  const parseServerRequest = (serverRequest) => ({
    id: serverRequest._id,
    method: serverRequest.method,
    url: serverRequest.url,
    headers: serverRequest.headers,
    body: serverRequest.body,
    query: parseQueryString(serverRequest.queryParams),
    response: {
      status: serverRequest.response?.status,
      data: serverRequest.response?.body ? tryParseJSON(serverRequest.response.body) : null,
      headers: serverRequest.response?.headers || {},
      latency: serverRequest.response?.latency,
      error: serverRequest.response?.error || null
    },
    timestamp: serverRequest.timestamp
  });

  const parseQueryString = (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};
    params.forEach((value, key) => (result[key] = value));
    return result;
  };

  const tryParseJSON = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return str || null;
    }
  };

  const safeJSONParse = (str, defaultValue) => {
    try {
      return str ? JSON.parse(str) : defaultValue;
    } catch (err) {
      console.error('JSON Parse Error:', err);
      return defaultValue;
    }
  };

  const applyEnvVariables = (url) => {
    return envVars.reduce(
      (acc, { key, value }) => acc.replace(`{{${key}}}`, encodeURIComponent(value || '')),
      url
    );
  };

  // === Запуск функциональных проверок (assertions) ===
  const runAssertions = (responseObj, latency, assertionsArray) => {
    return assertionsArray.map(a => {
      let actualValue;
      switch (a.type) {
        case 'status':
          actualValue = responseObj.status;
          break;
        case 'body':
          if (a.property) {
            actualValue = a.property
              .split('.')
              .reduce((o, k) => (o || {})[k], responseObj.data);
          } else {
            actualValue = JSON.stringify(responseObj.data);
          }
          break;
        case 'headers':
          actualValue = responseObj.headers[a.property?.toLowerCase()];
          break;
        case 'responseTime':
          actualValue = latency;
          break;
        default:
          actualValue = undefined;
      }

      let passed = false;
      const expected = a.expected;

      switch (a.operator) {
        case 'равно':
          passed = actualValue == expected;
          break;
        case 'не равно':
          passed = actualValue != expected;
          break;
        case 'содержит':
          passed = String(actualValue).includes(expected);
          break;
        case 'не содержит':
          passed = !String(actualValue).includes(expected);
          break;
        case 'больше чем':
          passed = Number(actualValue) > Number(expected);
          break;
        case 'меньше чем':
          passed = Number(actualValue) < Number(expected);
          break;
        case 'существует':
          passed = actualValue !== undefined && actualValue !== null;
          break;
        case 'не существует':
          passed = actualValue === undefined || actualValue === null;
          break;
        default:
          passed = false;
      }

      return {
        assertionId: a.id,
        type: a.type,
        operator: a.operator,
        property: a.property,
        actual: actualValue,
        expected,
        passed,
        message: passed
          ? 'Пройдено'
          : `Ожидалось [${a.type} ${a.operator} "${expected}"], получили "${String(actualValue)}"`
      };
    });
  };

  // === Работа с коллекциями: создание / удаление / drag'n'drop ===
  const handleCreateNewItem = async () => {
    try {
      const { data } = await axios.post(
        `/api/collections/${requestState.collectionId}/items`,
        {
          name: newItemName.trim(),
          type: newItemType,
          parentId: null,
          ...(newItemType === 'request' && {
            request: {
              method: 'GET',
              url: '',
              headers: {},
              body: {},
              queryParams: {}
            }
          })
        },
        { withCredentials: true }
      );

      queryClient.setQueryData(['collections'], (prev) =>
        prev.map((coll) =>
          coll._id === requestState.collectionId
            ? { ...coll, items: [...coll.items, data] }
            : coll
        )
      );

      setNewItemDialogOpen(false);
      setNewItemName('');
    } catch (err) {
      queryClient.invalidateQueries(['collections']);
      setError(err.response?.data?.message || 'Ошибка создания элемента');
    }
  };

  const {
    data: collections = [],
    isError,
    isLoading
  } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/api/collections', {
          withCredentials: true
        });
        return data.map(c => ({
          ...c,
          items: c.items?.sort((a, b) => a.order - b.order) || []
        }));
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Ошибка загрузки коллекций');
      }
    },
    retry: 1
  });

  const { mutate: createCollection } = useMutation({
    mutationFn: (name) =>
      axios.post(
        '/api/collections',
        { name },
        { withCredentials: true }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'], exact: true });
      setNewCollectionDialogOpen(false);
      setNewCollectionName('');
    },
    onError: (err) => console.error('Ошибка создание коллекций', err)
  });

  const { mutate: deleteItem } = useMutation({
    mutationFn: (itemId) =>
      axios.delete(`/api/collections/items/${itemId}`, { withCredentials: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] }),
    onError: (err) => console.error('Ошибка при удалении:', err)
  });

  const saveRequest = useMutation({
    mutationFn: async (item) => {
      const endpoint = item._id
        ? `/api/collections/items/${item._id}`
        : `/api/collections/${requestState.collectionId}/items`;
      const { data } = await axios.request({
        method: item._id ? 'put' : 'post',
        url: endpoint,
        data: item,
        withCredentials: true
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] })
  });

  const handleCollectionSelect = (collectionId) => {
    setRequestState(prev => ({ ...prev, collectionId, itemId: null }));
    setAssertions([]);
    setAssertionResults([]);
    setResponse(null);
  };

  const handleRequestSelect = (item) => {
    if (item.type === 'request') {
      setRequestState({
        ...item.request,
        headers: JSON.stringify(item.headers, null, 2),
        body: JSON.stringify(item.body, null, 2),
        queryParams: JSON.stringify(item.queryParams, null, 2),
        collectionId: item.collectionId,
        itemId: item.id
      });
      setAssertions([]);
      setAssertionResults([]);
      setResponse(null);
    }
  };

  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      if (!over || active.id === over.id) return;
      try {
        await axios.patch(
          `/api/collections/${requestState.collectionId}/reorder`,
          {
            items: [
              {
                id: active.id,
                parentId: over.id === String(requestState.collectionId) ? null : over.id,
                order: over.data.current.sortable.index
              }
            ]
          },
          { withCredentials: true }
        );
        queryClient.invalidateQueries(['collections']);
      } catch (err) {
        console.error('Reorder error:', err);
      }
    },
    [requestState.collectionId, queryClient]
  );

  // === Выполнение HTTP-запроса и вычисление результатов проверок ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAssertionResults([]);

    try {
      const trimmedUrl = apiUrl.trim();
      if (!trimmedUrl) throw new Error('Введите корректный URL');

      const parsedHeaders = safeJSONParse(headers, {});
      const parsedQuery = safeJSONParse(queryParams, {});
      const parsedBody = method !== 'GET' ? safeJSONParse(body, null) : undefined;

      let finalUrl = trimmedUrl;
      envVars.forEach(({ key, value }) => {
        finalUrl = finalUrl.replace(`{{${key}}}`, encodeURIComponent(value || ''));
      });

      const urlObj = new URL(finalUrl);
      Object.entries(parsedQuery).forEach(([k, v]) => {
        if (v != null && v !== '') urlObj.searchParams.append(k, v);
      });
      const targetUrl = urlObj.toString();

      if (auth.type === 'bearer') {
        parsedHeaders.Authorization = `Bearer ${auth.token}`;
      } else if (auth.type === 'basic') {
        parsedHeaders.Authorization = `Basic ${btoa(auth.token)}`;
      }

      const startTime = Date.now();
      const res = await axios.post(
        '/api/requests/makeRequest',
        {
          method: method.toLowerCase(),
          url: targetUrl,
          headers: parsedHeaders,
          data: parsedBody,
          validateStatus: () => true
        },
        { withCredentials: true }
      );
      const latency = Date.now() - startTime;

      // Нормализуем заголовки
      const normalizedHeaders = {};
      if (res.headers) {
        Object.entries(res.headers).forEach(([key, value]) => {
          normalizedHeaders[key.toLowerCase()] = value;
        });
      }

      const newRequest = {
        id: Date.now(),
        method,
        url: trimmedUrl,
        headers: parsedHeaders,
        body: parsedBody,
        query: parsedQuery,
        response: {
          status: res.status,
          data: res.data.data || res.data,
          headers: normalizedHeaders,
          latency,
          error: res.data.error || null
        },
        timestamp: new Date().toISOString()
      };

      // Запуск assertions
      const results = runAssertions(
        { status: res.status, data: res.data.data || res.data, headers: normalizedHeaders },
        latency,
        assertions
      );
      setAssertionResults(results);

      // Автосохранение в коллекцию (если задана)
      if (requestState.collectionId) {
        saveRequest.mutate({
          ...requestState,
          response: {
            status: res.status,
            body: JSON.stringify(res.data.data || res.data),
            headers: normalizedHeaders,
            latency,
            error: res.data.error || null
          }
        });
      }

      await fetchRequestHistory();
      setResponse(newRequest.response);
    } catch (err) {
      console.error('Request Error:', err);
      const errorResponse = {
        status: err.response?.status || 500,
        data: err.response?.data?.data || err.response?.data || { message: err.message },
        headers: err.response?.headers ? Object.fromEntries(
          Object.entries(err.response.headers).map(([k, v]) => [k.toLowerCase(), v])
        ) : {},
        latency: 0,
        error: {
          message: err.message,
          code: err.code,
          details: err.response?.data
        }
      };
      setResponse(errorResponse);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Переключение секций «Запрос» / «Расширенные» ===
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionHeader = ({ title, icon, sectionKey }) => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      onClick={() => toggleSection(sectionKey)}
      sx={{
        cursor: 'pointer',
        p: 1,
        borderRadius: '8px',
        '&:hover': { background: theme.palette.action.hover }
      }}
    >
      <IconButton size="small">{icon}</IconButton>
      <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
      <ExpandMoreRounded
        sx={{
          transform: expandedSections[sectionKey] ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          ml: 'auto'
        }}
      />
    </Stack>
  );

  const urlSuggestions = React.useMemo(
    () => [...new Set(history.map(req => req?.url).filter(url => url))],
    [history]
  );

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleAdvancedSettingsTabChange = (event, newValue) => {
    setAdvancedSettingsTab(newValue);
  };

  // === Фильтрация и поиск истории ===
  const filteredHistory = React.useMemo(() => {
    return history.filter(req => {
      const matchesSearch = req.url.toLowerCase().includes(historySearch.toLowerCase()) ||
                          req.method.toLowerCase().includes(historySearch.toLowerCase());
      
      const matchesFilter = historyFilter === 'all' ? true :
                          historyFilter === 'success' ? req.response?.status < 400 :
                          historyFilter === 'error' ? req.response?.status >= 400 :
                          historyFilter === 'get' ? req.method === 'GET' :
                          historyFilter === 'post' ? req.method === 'POST' :
                          historyFilter === 'put' ? req.method === 'PUT' :
                          historyFilter === 'delete' ? req.method === 'DELETE' :
                          historyFilter === 'patch' ? req.method === 'PATCH' :
                          historyFilter === 'head' ? req.method === 'HEAD' :
                          historyFilter === 'options' ? req.method === 'OPTIONS' :
                          historyFilter === 'trace' ? req.method === 'TRACE' : true;

      return matchesSearch && matchesFilter;
    });
  }, [history, historySearch, historyFilter]);

  const paginatedHistory = React.useMemo(() => {
    const start = historyPage * historyRowsPerPage;
    return filteredHistory.slice(start, start + historyRowsPerPage);
  }, [filteredHistory, historyPage, historyRowsPerPage]);

  const handleHistoryPageChange = (event, newPage) => {
    setHistoryPage(newPage - 1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, height: '100vh' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>

        {/* Секция коллекций */}
        <Grid item xs={12} md={3} lg={2}>
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CollectionsBookmark sx={{ mr: 1 }} />
              <Typography variant="h6">Коллекции</Typography>
              <IconButton
                aria-controls="collections-menu"
                aria-haspopup="true"
                aria-expanded={Boolean(collectionsMenu)}
                id="collections-menu-button"
                onClick={(e) => setCollectionsMenu(e.currentTarget)}
                sx={{ ml: 'auto' }}
              >
                <Add />
              </IconButton>
            </Box>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={collections}>
                {collections?.map(collection => (
                  <CollectionTree
                    key={collection._id}
                    collection={collection}
                    onSelect={handleRequestSelect}
                    onContextMenu={(e) => setCollectionsMenu(e.currentTarget)}
                    selected={requestState.collectionId === collection._id}
                    onDelete={deleteItem}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Paper>
        </Grid>

        {/* Основная область: форма + ответ */}
        <Grid item xs={12} md={9} lg={10} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <StyledPaper sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Запрос" icon={<SendRounded />} />
              <Tab label="История" icon={<HistoryRounded />} />
              <Tab label="WebSocket" icon={<WifiTetheringRounded />} />
              <Tab label="Нагрузочное тестирование" icon={<AssessmentRounded />} />
              {/* <Tab label="Переменные" icon={<SettingsRounded />} /> */}
            </Tabs>

            {activeTab === 2 ? (
              <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
                <WebSocketClient collectionId={requestState.collectionId} />
              </Box>
            ) : activeTab === 3 ? (
              <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
                <LoadTestTab collectionId={requestState.collectionId} />
              </Box>
            ) 
            // : activeTab === 4 ? (
            //   <EnvironmentVariables variables={envVars} onChange={setEnvVars} />
            // ) 
            : (
              <Grid container spacing={3} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {/* Левая часть: форма */}
                <Grid item xs={12} md={6} lg={6} sx={{ height: '100%' }}>
                  <StyledPaper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
                    {activeTab === 0 ? (
                      <Stack spacing={3} sx={{ flex: 1 }}>
                        <SectionHeader title="Настройка запроса" icon={<SendRounded />} sectionKey="request" />
                        {expandedSections.request && (
                          <Stack spacing={2}>
                            <Grid container spacing={1} alignItems="center">
                              <div item xs={3}>
                                <MethodSelector value={method} onChange={setMethod} fullWidth />
                              </div>
                              <Grid item xs={9}>
                                <ApiInput
                                  value={apiUrl}
                                  onChange={setApiUrl}
                                  onBlur={() => setApiUrl(apiUrl.trim())}
                                  suggestions={urlSuggestions}
                                />
                              </Grid>
                            </Grid>
                            <Divider sx={{ my: 1 }} />
                            <SectionHeader title="Расширенные настройки" icon={<SettingsRounded />} sectionKey="advanced" />
                            {expandedSections.advanced && (
                              <Stack spacing={2}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                  <Tabs
                                    value={advancedSettingsTab}
                                    onChange={handleAdvancedSettingsTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{ minHeight: 48 }}
                                  >
                                    <Tab 
                                      icon={<SecurityRounded />} 
                                      label="Аутентификация" 
                                      iconPosition="start"
                                      sx={{ minHeight: 48 }}
                                    />
                                    <Tab 
                                      icon={<LinkRounded />} 
                                      label="Параметры" 
                                      iconPosition="start"
                                      sx={{ minHeight: 48 }}
                                    />
                                    <Tab 
                                      icon={<StorageRounded />} 
                                      label="Заголовки" 
                                      iconPosition="start"
                                      sx={{ minHeight: 48 }}
                                    />
                                    <Tab 
                                      icon={<CodeRounded />} 
                                      label="Тело" 
                                      iconPosition="start"
                                      sx={{ minHeight: 48 }}
                                    />
                                    <Tab 
                                      icon={<CheckCircleRounded />} 
                                      label="Проверки" 
                                      iconPosition="start"
                                      sx={{ minHeight: 48 }}
                                    />
                                  </Tabs>
                                </Box>

                                <Box sx={{ p: 1 }}>
                                  {advancedSettingsTab === 0 && (
                                    <AuthInput value={auth} onChange={setAuth} compact />
                                  )}
                                  {advancedSettingsTab === 1 && (
                                    <QueryParamsInput value={queryParams} onChange={setQueryParams} />
                                  )}
                                  {advancedSettingsTab === 2 && (
                                    <HeadersInput value={headers} onChange={setHeaders} />
                                  )}
                                  {advancedSettingsTab === 3 && (
                                    <BodyInput value={body} onChange={setBody} method={method} />
                                  )}
                                  {advancedSettingsTab === 4 && (
                                    <AssertionsInput onChange={setAssertions} />
                                  )}
                                </Box>
                              </Stack>
                            )}
                          </Stack>
                        )}
                        <AnimatedButton
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<SendRounded />}
                          onClick={handleSubmit}
                          disabled={loading}
                          sx={{
                            mt: 'auto',
                            py: 1.5,
                            borderRadius: '12px',
                            bgcolor: 'primary.light',
                            '&:disabled': { animation: `${pulse} 1.5s infinite` }
                          }}
                        >
                          {loading ? 'Загрузка...' : 'Выполнить запрос'}
                        </AnimatedButton>
                      </Stack>
                    ) : activeTab === 1 ? (
                      <Stack spacing={1} sx={{ flex: 1, overflow: 'auto' }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 2, p: 2 }}>
                          <TextField
                            size="small"
                            placeholder="Поиск по URL или методу..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            sx={{ flex: 1 }}
                          />
                          <Select
                            size="small"
                            value={historyFilter}
                            onChange={(e) => setHistoryFilter(e.target.value)}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="all">Все запросы</MenuItem>
                            <MenuItem value="success">Успешные</MenuItem>
                            <MenuItem value="error">Ошибки</MenuItem>
                            <Divider />
                            <MenuItem value="get">GET</MenuItem>
                            <MenuItem value="post">POST</MenuItem>
                            <MenuItem value="put">PUT</MenuItem>
                            <MenuItem value="delete">DELETE</MenuItem>
                            <MenuItem value="patch">PATCH</MenuItem>
                            <MenuItem value="head">HEAD</MenuItem>
                            <MenuItem value="options">OPTIONS</MenuItem>
                            <MenuItem value="trace">TRACE</MenuItem>
                          </Select>
                        </Stack>
                        {loadingHistory ? (
                          <LinearProgress />
                        ) : filteredHistory.length === 0 ? (
                          <Typography color="text.secondary" sx={{ p: 2 }}>
                            {historySearch || historyFilter !== 'all' 
                              ? 'Запросы не найдены' 
                              : 'В истории запросов не найдено'}
                          </Typography>
                        ) : (
                          <>
                            {paginatedHistory.map((req) => (
                              <Paper
                                key={req.id}
                                sx={{
                                  p: 1.5,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'action.hover' },
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => {
                                  setRequestState(prev => ({
                                    ...prev,
                                    url: req.url,
                                    method: req.method,
                                    headers: JSON.stringify(req.headers, null, 2),
                                    body: req.body ? JSON.stringify(req.body, null, 2) : '',
                                    queryParams: JSON.stringify(req.query, null, 2)
                                  }));
                                  setApiUrl(req.url);
                                  setMethod(req.method);
                                  setHeaders(JSON.stringify(req.headers, null, 2));
                                  setBody(req.body ? JSON.stringify(req.body, null, 2) : '');
                                  setQueryParams(JSON.stringify(req.query, null, 2));
                                  setResponse(req.response);
                                  setActiveTab(0);
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Chip
                                    label={req.method}
                                    color={
                                      req.response?.status >= 400
                                        ? 'error'
                                        : req.method === 'GET'
                                        ? 'success'
                                        : 'warning'
                                    }
                                    size="small"
                                  />
                                  <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                                    {req.url}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(req.timestamp).toLocaleTimeString()}
                                  </Typography>
                                </Stack>
                              </Paper>
                            ))}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                              <Pagination
                                count={Math.ceil(filteredHistory.length / historyRowsPerPage)}
                                page={historyPage + 1}
                                onChange={handleHistoryPageChange}
                                color="primary"
                                size="small"
                              />
                            </Box>
                          </>
                        )}
                      </Stack>
                    ) : null}
                  </StyledPaper>
                </Grid>

                {/* Правая часть: ответ */}
                {activeTab === 0 && (
                  <Grid item xs={12} md={6} lg={6} sx={{ height: '100%' }}>
                    <StyledPaper sx={{ height: '100%', p: 0 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>Ответ</Typography>
                        {response?.status && (
                          <Chip
                            label={`${response.status} • ${response.latency}ms`}
                            size="small"
                            color={
                              response.status >= 400
                                ? 'error'
                                : response.status >= 200
                                ? 'success'
                                : 'info'
                            }
                          />
                        )}
                      </Stack>
                      {loading ? (
                        <LinearProgress sx={{ height: 2 }} />
                      ) : response ? (
                        <>
                          <ResponseDisplay
                            data={response.data}
                            headers={response.headers}
                            sx={{ height: 'calc(100% - 48px)', overflow: 'auto', p: 2 }}
                          />
                          {assertionResults.length > 0 && (
                            <Box sx={{ 
                              borderTop: 1, 
                              borderColor: 'divider',
                              bgcolor: 'background.paper',
                              p: 2
                            }}>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">
                                  Результаты проверок
                                </Typography>
                                <Chip
                                  size="small"
                                  label={`${assertionResults.filter(r => r.passed).length}/${assertionResults.length} пройдено`}
                                  color={assertionResults.every(r => r.passed) ? 'success' : 'warning'}
                                />
                              </Stack>
                              <List>
                                {assertionResults.map(r => (
                                  <ListItem
                                    key={r.assertionId}
                                    sx={{
                                      bgcolor: r.passed ? 'success.lighter' : 'error.lighter',
                                      borderRadius: 1,
                                      mb: 1,
                                      border: '1px solid',
                                      borderColor: r.passed ? 'success.light' : 'error.light'
                                    }}
                                  >
                                    <ListItemIcon>
                                      {r.passed ? (
                                        <CheckCircle color="success" />
                                      ) : (
                                        <Cancel color="error" />
                                      )}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" color={r.passed ? 'success.dark' : 'error.dark'}>
                                          {r.type === 'status' ? 'Статус код' :
                                           r.type === 'body' ? 'Тело ответа' :
                                           r.type === 'headers' ? 'Заголовки' :
                                           r.type === 'responseTime' ? 'Время ответа' : r.type}
                                          {' '}
                                          {r.operator}
                                          {' '}
                                          {r.property ? `"${r.property}"` : ''}
                                          {' '}
                                          {r.expected ? `"${r.expected}"` : ''}
                                        </Typography>
                                      }
                                      secondary={
                                        <Tooltip title="Фактическое значение">
                                          <Typography variant="caption" color="text.secondary">
                                            Получено: {String(r.actual)}
                                          </Typography>
                                        </Tooltip>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </>
                      ) : (
                        <Stack
                          spacing={2}
                          sx={{
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary'
                          }}
                        >
                          <ReplayRounded sx={{ fontSize: 48, opacity: 0.5 }} />
                          <Typography variant="body2">Отправьте запрос, чтобы увидеть ответ</Typography>
                        </Stack>
                      )}
                    </StyledPaper>
                  </Grid>
                )}
              </Grid>
            )}
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Меню управления коллекциями */}
      <Menu
        anchorEl={collectionsMenu}
        open={Boolean(collectionsMenu)}
        onClose={() => setCollectionsMenu(null)}
        MenuListProps={{ 'aria-labelledby': 'collections-menu-button' }}
      >
        <MenuItem
          onClick={() => {
            const name = prompt('Введите название коллекции');
            if (name) createCollection(name);
            setCollectionsMenu(null);
          }}
        >
          Новая коллекция
        </MenuItem>
      </Menu>

      <Portal>
        <Dialog
          open={newItemDialogOpen}
          onClose={() => setNewItemDialogOpen(false)}
          fullWidth
        >
          <DialogTitle>Создать новый элемент</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 400 }}>
            <Select
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="request">Запрос</MenuItem>
              <MenuItem value="folder">Папка</MenuItem>
            </Select>
            <TextField
              label="Название элемента"
              fullWidth
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewItemDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleCreateNewItem}
              disabled={!newItemName.trim() || !requestState.collectionId}
              variant="contained"
            >
              Создать
            </Button>
          </DialogActions>
        </Dialog>
      </Portal>

      {/* Отображение ошибок */}
      {error && (
        <Alert severity="error" sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}
