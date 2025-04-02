import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  useTheme,
  TextField 
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
  Delete
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
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
  const [activeTab, setActiveTab] = useState(0);
  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [collections, setCollections] = useState([]);
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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    name: '',
    method: 'GET',
    url: '',
    headers: '{}',
    body: ''
  });
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequestHistory();
    fetchCollections();
  }, []);

  const fetchRequestHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await axios.get('/api/requests/history');
      const parsedRequests = response.data.map(parseServerRequest);
      setRequestHistory(parsedRequests);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load request history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await axios.get('/api/collections');
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to load collections');
    }
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
      console.error('JSON Parse Error:', { input: str, error });
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
      await fetchRequestHistory();

      setResponse(newRequest.response);

    } catch (error) {
      setError(error.message);
      console.error('Request Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSaveToCollection = async () => {
    try {
      const requestData = {
        name: `Request ${new Date().toLocaleString()}`,
        method,
        url: apiUrl,
        headers: JSON.parse(headers),
        body: body ? JSON.parse(body) : null,
        queryParams: JSON.parse(queryParams)
      };

      await axios.post(`/api/collections/${selectedCollectionId}/requests`, requestData);
      setSaveDialogOpen(false);
      fetchCollections();
    } catch (error) {
      setError('Failed to save request to collection');
    }
  };

  const handleCreateCollection = async () => {
    try {
      await axios.post('/api/collections', { name: newCollectionName });
      await fetchCollections();
      setNewCollectionDialogOpen(false);
      setNewCollectionName('');
    } catch (error) {
      setError('Failed to create collection');
    }
  };

  const handleCreateRequest = async () => {
    try {
      await axios.post(`/api/collections/${selectedCollectionId}/requests`, {
        ...newRequestData,
        queryParams: '{}'
      });
      await fetchCollections();
      setNewRequestDialogOpen(false);
      setNewRequestData({
        name: '',
        method: 'GET',
        url: '',
        headers: '{}',
        body: ''
      });
    } catch (error) {
      setError('Failed to create request');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await axios.delete(`/api/collections/${collectionId}`);
      await fetchCollections();
    } catch (error) {
      setError('Failed to delete collection');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await axios.delete(`/api/collections/requests/${requestId}`);
      await fetchCollections();
    } catch (error) {
      setError('Failed to delete request');
    }
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
        {/* Коллекции */}
        <Grid item xs={12} md={3} lg={2} sx={{ height: '100%' }}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CollectionsBookmark sx={{ mr: 1 }} />Коллекции
            </Typography>
            
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Add />}
              onClick={() => setNewCollectionDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Новая коллекция
            </Button>

            <List sx={{ overflow: 'auto', maxHeight: '80vh' }}>
              {collections.map(collection => (
                <div key={collection._id}>
                  <ListItem 
                    button 
                    selected={selectedCollectionId === collection._id}
                    sx={{ position: 'relative' }}
                  >
                    <div 
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onClick={() => setSelectedCollectionId(
                        selectedCollectionId === collection._id ? '' : collection._id
                      )}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Folder sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText 
                          primary={collection.name} 
                          secondary={`${collection.requests?.length || 0} items`}
                        />
                      </div>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(collection._id);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </div>
                  </ListItem>
                  
                  {selectedCollectionId === collection._id && (
                    <List sx={{ pl: 4 }}>
                      {collection.requests?.map(request => (
                        <ListItem 
                          key={request._id}
                          button 
                          selected={selectedRequest === request._id}
                          sx={{ pl: 4 }}
                          onClick={() => {
                            setSelectedRequest(request._id);
                            setMethod(request.method);
                            setApiUrl(request.url);
                            setHeaders(JSON.stringify(request.headers, null, 2));
                            setBody(request.body ? JSON.stringify(request.body, null, 2) : '');
                            setQueryParams(JSON.stringify(request.queryParams, null, 2));
                          }}
                        >
                          <ListItemText
                            primary={request.name}
                            secondary={`${request.method} ${request.url}`}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(request._id);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </ListItem>
                      ))}
                      <Button 
                        fullWidth 
                        variant="text" 
                        startIcon={<Add />}
                        onClick={() => setNewRequestDialogOpen(true)}
                        sx={{ mt: 1 }}
                      >
                        Добавить запрос
                      </Button>
                    </List>
                  )}
                </div>
              ))}
            </List>
          </StyledPaper>
        </Grid>

        {/* Основная форма */}
        <Grid item xs={12} md={6} lg={5} sx={{ height: '100%' }}>
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
                      <Grid item xs={3}>
                        <MethodSelector 
                          value={method} 
                          onChange={setMethod} 
                          fullWidth 
                        />
                      </Grid>
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

      {/* Диалог создания коллекции */}
      <Dialog open={newCollectionDialogOpen} onClose={() => setNewCollectionDialogOpen(false)}>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          <TextField
            fullWidth
            label="Collection Name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleCreateCollection}
            disabled={!newCollectionName.trim()}
          >
            Create Collection
          </Button>
        </DialogContent>
      </Dialog>

      {/* Диалог создания запроса */}
      <Dialog open={newRequestDialogOpen} onClose={() => setNewRequestDialogOpen(false)}>
        <DialogTitle>Create New Request</DialogTitle>
        <DialogContent sx={{ minWidth: 600 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Request Name"
              fullWidth
              value={newRequestData.name}
              onChange={(e) => setNewRequestData({...newRequestData, name: e.target.value})}
            />
            
            <MethodSelector
              value={newRequestData.method}
              onChange={(method) => setNewRequestData({...newRequestData, method})}
            />
            
            <ApiInput
              value={newRequestData.url}
              onChange={(url) => setNewRequestData({...newRequestData, url})}
            />
            
            <HeadersInput
              value={newRequestData.headers}
              onChange={(headers) => setNewRequestData({...newRequestData, headers})}
            />
            
            <BodyInput
              value={newRequestData.body}
              onChange={(body) => setNewRequestData({...newRequestData, body})}
              method={newRequestData.method}
            />
            
            <Button 
              variant="contained" 
              onClick={handleCreateRequest}
              disabled={!newRequestData.name.trim() || !newRequestData.url.trim()}
            >
              Create Request
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Диалог сохранения в коллекцию */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save to Collection</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Select
            fullWidth
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>Select collection</MenuItem>
            {collections.map(collection => (
              <MenuItem key={collection._id} value={collection._id}>
                {collection.name} ({collection.requests?.length || 0})
              </MenuItem>
            ))}
          </Select>
          
          <Button 
            fullWidth 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={handleSaveToCollection}
            disabled={!selectedCollectionId}
          >
            Save Request
          </Button>
        </DialogContent>
      </Dialog>

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