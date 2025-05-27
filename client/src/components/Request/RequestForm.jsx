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
  List,
  ListItem,
  ListItemText,
  useTheme,
  TextField,
  Box,
  Menu,
  Portal 
} from '@mui/material';
import {
  SendRounded,
  HistoryRounded,
  SettingsRounded,
  CodeRounded,
  ContentCopyRounded,
  ReplayRounded,
  ExpandMoreRounded,
  Folder,
  Add,
  CollectionsBookmark,
  Edit,
  Delete,
  MoreVert
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import { CollectionTree } from './Collections/CollectionTree';
import ApiInput from './Api/ApiInput';
import MethodSelector from './Api/MethodSelector';
import HeadersInput from './Api/HeadersInput';
import BodyInput from './Api/BodyInput';
import ResponseDisplay from './Response/ResponseDisplay';
import QueryParamsInput from './Api/QueryParamsInput';
import EnvironmentVariables from './Api/EnvironmentVariables';
import AuthInput from './Api/AuthInput';




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

const RequestForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
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
  const [contextMenu, setContextMenu] = useState(null);
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
const [newItemType, setNewItemType]=useState('request');
const [newItemName, setNewItemName]=useState('');
  

  useEffect(() => {
    fetchRequestHistory();
  }, []);

  const fetchRequestHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/requests/history', {
        headers: {
           Authorization: `Bearer ${token}`
        }
      });
      const parsedRequests = response.data.map(parseServerRequest);
      setRequestHistory(parsedRequests);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load request history');
    } finally {
      setLoadingHistory(false);
    }
  };

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
      }
    );

    queryClient.setQueryData(['collections'], prev => 
      prev.map(coll => 
        coll._id === requestState.collectionId
          ? { ...coll, items: [...coll.items, data] }
          : coll
      )
    );
    
    setNewItemDialogOpen(false);
    setNewItemName('');
  } catch (error) {
    queryClient.invalidateQueries(['collections']);
    setError(error.response?.data?.message || 'Ошибка создания элемента');
  }
};
const { data: collections = [], isError, isLoading } = useQuery({
  queryKey: ['collections'],
  queryFn: async () => {
    try {
      const { data } = await axios.get('/api/collections', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return data.map(c => ({
        ...c,
        items: c.items?.sort((a, b) => a.order - b.order) || []
      }));
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Ошибка загрузки коллекций'
      );
    }
  },
  retry: 1
});

// Добавьте отображение ошибки
{isError && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
)}


  // создание коллекцийcollections
const {mutate: createCollection} = useMutation({
  mutationFn: (name)=> axios.post('/api/collections', {name}),
  onSuccess: ()=>{
    queryClient.invalidateQueries({
      queryKey: ['collections'], // обновление списка
      exact: true
    });
    setNewCollectionDialogOpen(false);
    setNewCollectionName('');},
    onError: (error)=>{
      console.error('Ошибка создание коллекций', error)
    }
  }
)

// удаление коллекций
const { mutate: deleteItem } = useMutation({
  mutationFn: (itemId) => axios.delete(`/api/collections/items/${itemId}`),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['collections'] });
  },
  onError: (error) => {
    console.error('Ошибка при удалении:', error);
  }
});

  const saveRequest = useMutation({
    mutationFn: async (item) => {
      const endpoint = item._id 
        ? `/api/collections/items/${item._id}`
        : `/api/collections/${requestState.collectionId}/items`;
      
      const { data } = await axios[endpoint ? 'put' : 'post'](endpoint, item);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] })
  });

  // Обработчики коллекций
  const handleCollectionSelect = (collectionId) => {
    setRequestState(prev => ({ ...prev, collectionId, itemId: null }));
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
    }
  };

  // Drag and Drop
  const handleDragEnd = useCallback(async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    try {
      await axios.patch(`/api/collections/${requestState.collectionId}/reorder`, {
        itemId: active.id,
        newParentId: over.id,
        newIndex: over.data.current.sortable.index
      });
      queryClient.invalidateQueries(['collections']);
    } catch (error) {
      console.error('Reorder error:', error);
    }
  }, [requestState.collectionId]);
  const applyEnvVariables = (url) => {
    return envVars.reduce((acc, { key, value }) => 
      acc.replace(`{{${key}}}`, encodeURIComponent(value || '')), url);
  };

  const parseServerRequest = (serverRequest) => ({
    id: serverRequest._id,
    method: serverRequest.method,
    url: serverRequest.url,
    headers: serverRequest.headers,
    body: serverRequest.body,
    query: parseQueryString(serverRequest.queryParams),
    response: {
      status: serverRequest.response?.status,
      data: tryParseJSON(serverRequest.response?.body),
      headers: serverRequest.response?.headers,
      latency: serverRequest.response?.latency
    },
    timestamp: serverRequest.timestamp
  });

  const parseQueryString = (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};
    params.forEach((value, key) => result[key] = value);
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
    } catch (error) {
      console.error('JSON Parse Error:', error);
      return defaultValue;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const trimmedUrl = apiUrl.trim();
      if (!trimmedUrl) throw new Error('Please enter a valid URL');

      const parsedHeaders = safeJSONParse(headers, {});
      const parsedQuery = safeJSONParse(queryParams, {});
      const parsedBody = method !== 'GET' ? safeJSONParse(body, null) : undefined;

      let finalUrl = trimmedUrl;
      envVars.forEach(({ key, value }) => {
        finalUrl = finalUrl.replace(`{{${key}}}`, encodeURIComponent(value || ''));
      });

      const urlObj = new URL(finalUrl);
      
      Object.entries(parsedQuery).forEach(([key, value]) => {
        if (value != null && value !== '') {
          urlObj.searchParams.append(key, value);
        }
      });

      const targetUrl = urlObj.toString();

      if (auth.type === 'bearer') {
        parsedHeaders.Authorization = `Bearer ${auth.token}`;
      } else if (auth.type === 'basic') {
        parsedHeaders.Authorization = `Basic ${btoa(auth.token)}`;
      }

      const startTime = Date.now();
      const result = await axios.post('/api/requests/makeRequest', {
        method: method.toLowerCase(),
        url: targetUrl,
        headers: parsedHeaders,
        data: parsedBody,
        validateStatus: () => true
      });

      const newRequest = {
        id: Date.now(),
        method,
        url: trimmedUrl,
        headers: parsedHeaders,
        body: parsedBody,
        query: parsedQuery,
        response: {
          status: result.status,
          data: result.data,
          headers: result.headers,
          latency: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      };

      // Автосохранение в коллекцию
      if (requestState.collectionId) {
        saveRequest.mutate({
          ...requestState,
          response: {
            status: response.status,
            data: JSON.stringify(response.data),
            headers: response.headers,
            latency: response.latency
          }
        });
      }

      await fetchRequestHistory();

      setResponse(newRequest.response);

    } catch (error) {
      setError(error.message);
      console.error('Request Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция для переключения секций
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
      <IconButton size="small">
        {icon}
      </IconButton>
      <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
      <ExpandMoreRounded sx={{ 
        transform: expandedSections[sectionKey] ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.2s',
        ml: 'auto'
      }}/>
    </Stack>
  );

  const urlSuggestions = React.useMemo(
    () => [...new Set(requestHistory
      .map(req => req?.url)
      .filter(Boolean))], 
    [requestHistory]
  );

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
              aria-controls='collections-menu'
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

        {/* Основная форма */}
  <Grid item xs={12} md={6} lg={5}>
          <StyledPaper>
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => setActiveTab(v)}
              sx={{ 
                mb: 2,
                '& .MuiTabs-indicator': { height: 2 }
              }}
            >
              <Tab 
                label="Запрос" 
                icon={<CodeRounded fontSize="small" />} 
                sx={{ minHeight: 48 }}
              />
              <Tab 
                label="История" 
                icon={<HistoryRounded fontSize="small" />} 
                sx={{ minHeight: 48 }}
              />
              <Tab 
                label="Настройки" 
                icon={<SettingsRounded fontSize="small" />} 
                sx={{ minHeight: 48 }}
              />
            </Tabs>

            {activeTab === 0 ? (
              <Stack spacing={3} sx={{ flex: 1 }}>
                <SectionHeader
                  title="Настройка запроса"
                  icon={<SendRounded />}
                  sectionKey="request"
                />
                
                {expandedSections.request && (
                  <Stack spacing={2}>
                    <Grid container spacing={1} alignItems="center">
                      <div item xs={3}>
                        <MethodSelector 
                          value={method} 
                          onChange={setMethod} 
                          fullWidth 
                        />
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

                    <SectionHeader
                      title="Расширенные настройки"
                      icon={<SettingsRounded />}
                      sectionKey="advanced"
                    />

                    {expandedSections.advanced && (
                      <Stack spacing={2}>
                        <AuthInput 
                          value={auth} 
                          onChange={setAuth} 
                          compact 
                        />
                        <QueryParamsInput 
                          value={queryParams} 
                          onChange={setQueryParams} 
                        />
                        <HeadersInput 
                          value={headers} 
                          onChange={setHeaders} 
                        />
                        <BodyInput 
                          value={body} 
                          onChange={setBody} 
                          method={method} 
                        />
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
              <Stack spacing={1} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                {loadingHistory ? (
                  <LinearProgress />
                ) : requestHistory.length === 0 ? (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    В истории запросов не найдено
                  </Typography>
                ) : (
                  requestHistory.map((request) => (
                    <Paper 
                      key={request.id}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        setApiUrl(request.url);
                        setMethod(request.method);
                        setHeaders(JSON.stringify(request.headers, null, 2));
                        setBody(request.body ? JSON.stringify(request.body, null, 2) : '');
                        setQueryParams(JSON.stringify(request.query, null, 2));
                        setResponse(request.response);
                        setActiveTab(0);
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Chip
                          label={request.method}
                          color={
                            request.response?.status >= 400                              ? 'error' : 
                            request.method === 'GET' ? 'success' : 'warning'
                          }
                          size="small"
                        />
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {request.url}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(request.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            ) : (
              <EnvironmentVariables 
                variables={envVars} 
                onChange={setEnvVars} 
              />
            )}
          </StyledPaper>
        </Grid>

        {/* Ответ */}
  <Grid item xs={12} md={3} lg={5} sx={{ height: '100%' }}>
          <StyledPaper sx={{ p: 0 }}>
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
                    response.status >= 400 ? 'error' : 
                    response.status >= 200 ? 'success' : 'info'
                  }
                />
              )}
            </Stack>

            {loading ? (
              <LinearProgress sx={{ height: 2 }} />
            ) : response ? (
              <ResponseDisplay 
                data={response.data} 
                headers={response.headers}
                sx={{ height: 'calc(100% - 48px)', overflow: 'auto', p: 2 }}
              />
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
                <Typography variant="body2">Отправьте запрос что бы увидеть ответ</Typography>
              </Stack>
            )}
          </StyledPaper>
        </Grid>
      </Grid>


      {/* Меню управления коллекциями */}
      <Menu anchorEl={collectionsMenu} open={Boolean(collectionsMenu)} onClose={()=>setCollectionsMenu(null)} MenuListProps={{'aria-labelledby': 'collections-menu-button'}}>
          <MenuItem onClick={()=>{
            const name =prompt('Введите название коллекции');
            if(name) createCollection(name);
            setCollectionsMenu(null);
          }}>Новая коллекции</MenuItem>
          {/* <MenuItem onClick={()=>{
            setNewItemDialogOpen(true); setCollectionsMenu(null);
          }}>
            Новый элемент
          </MenuItem> */}

      </Menu>
          <Portal>
<Dialog open={newItemDialogOpen} onClose={()=>setNewItemDialogOpen(false)} role="dialog" aria-labelledby='new-item-dialog-title' aria-modal="true" disableEnforceFocus  disablePortal       disableScrollLock  componentsProps={{backdrop:{
  style: {pointerEvents: 'none'}
}}}>
      <DialogTitle id="new-item-dialog">
        Создать новый элемент
      </DialogTitle>
            <DialogContent>
              <Select
              value={newItemType}
              onChange={(e)=>setNewItemType(e.target.value)}
              fullWidth
              sx={{mb:2}}>
                <MenuItem value="request">Запрос</MenuItem>
                <MenuItem value="folder">Папка</MenuItem>
              </Select>
              <TextField label="Название элемента"
              fullWidth value={newItemName} onChange={(e)=>setNewItemName(e.target.value)} autoFocus/>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>setNewItemDialogOpen(false)}>Отмена</Button>
              <Button
              onClick={handleCreateNewItem} disabled={!newItemName.trim() || !requestState.collectionId} variant="contained">Создать</Button>
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
};

export default RequestForm;