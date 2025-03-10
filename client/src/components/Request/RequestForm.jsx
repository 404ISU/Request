// components/RequestForm.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Box,
  Tabs,
  Tab,
  useTheme,
  ThemeProvider,
  createTheme,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ApiInput from './Api/ApiInput';
import MethodSelector from './Api/MethodSelector';
import HeadersInput from './Api/HeadersInput';
import BodyInput from './Api/BodyInput';
import RequestHistory from './Response/RequestHistory';
import ResponseDisplay from './Response/ResponseDisplay';
import AuthInput from './Api/AuthInput';
import QueryParamsInput from './Api/QueryParamsInput';
import EnvironmentVariables from './Api/EnvironmentVariables';

import AssertionsInput from './Api/AssertionsInput';
import axios from 'axios';

const RequestForm = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState('get');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('{}');
  const [requestHistory, setRequestHistory] = useState([]);
  const [response, setResponse] = useState(null);
  const [auth, setAuth] = useState({ type: 'none', token: '' });
  const [queryParams, setQueryParams] = useState([]);
  const [envVariables, setEnvVariables] = useState([]);
  const [savedRequests, setSavedRequests] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleApiUrlChange = (e) => setApiUrl(e.target.value);
  const handleMethodChange = (e) => setMethod(e.target.value);
  const handleHeadersChange = (newValue) => {setHeaders(newValue)};
  const handleBodyChange = (e) => setBody(e.target.value);
  const handleAuthChange = (auth) => setAuth(auth);
  const handleQueryParamsChange = (params) => setQueryParams(params);
  const handleFileChange = (file) => setFile(file);
  const handleEnvVariablesChange = (variables) => setEnvVariables(variables);
  const handleSaveRequest = (name) => {
    const request = {
      name,
      apiUrl,
      method,
      headers,
      body,
      queryParams,
      auth,
      file,
    };
    setSavedRequests([...savedRequests, request]);
  };
  const handleLoadRequest = (name) => {
    const request = savedRequests.find((req) => req.name === name);
    if (request) {
      setApiUrl(request.apiUrl);
      setMethod(request.method);
      setHeaders(request.headers);
      setBody(request.body);
      setQueryParams(request.queryParams);
      setAuth(request.auth);
      setFile(request.file);
    }
  };
  const handleAssertionChange = (assertions) => setAssertions(assertions);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = new URL(apiUrl);
      queryParams.forEach((param) => {
        url.searchParams.append(param.key, param.value);
      });
  
      let finalUrl = apiUrl;
      let finalHeaders = headers;
      let finalBody = body;
  
      envVariables.forEach((variable) => {
        finalUrl = finalUrl.replace(`{{${variable.key}}}`, variable.value);
        finalHeaders = finalHeaders.replace(`{{${variable.key}}}`, variable.value);
        finalBody = finalBody.replace(`{{${variable.key}}}`, variable.value);
      });
  
      const parsedHeaders = finalHeaders ? JSON.parse(finalHeaders) : {};
      const parsedBody = finalBody ? JSON.parse(finalBody) : null;
  
      if (auth.type === 'bearer') {
        parsedHeaders['Authorization'] = `Bearer ${auth.token}`;
      } else if (auth.type === 'basic') {
        parsedHeaders['Authorization'] = `Basic ${btoa(auth.token)}`;
      }
  
      const response = await axios.post('http://localhost:5001/api/requests/makeRequest', {
        url: finalUrl.toString(),
        method,
        headers: JSON.stringify(parsedHeaders),
        body: JSON.stringify(parsedBody),
      });
  
      assertions.forEach((assertion) => {
        if (assertion.type === 'status' && response.status !== parseInt(assertion.expected)) {
          throw new Error(`Assertion failed: Expected status ${assertion.expected}, got ${response.status}`);
        } else if (
          assertion.type === 'body' &&
          typeof response.data === 'string' &&
          !response.data.includes(assertion.expected)
        ) {
          throw new Error(`Assertion failed: Expected body to contain "${assertion.expected}"`);
        }
      });
  
      setResponse({
        data: response.data,
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      setResponse({
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    } finally {
      fetchHistory();
    }
  };

  const fetchHistory = async () => {
    try {
      const historyResponse = await axios.get('http://localhost:5001/api/requests/history', {
        withCredentials: true,
      });
      setRequestHistory(historyResponse.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Обработка выбора запроса из истории
  const handleReuseRequest = (request) => {
    // Преобразуем заголовки и тело в JSON (если они строки)
    const parsedHeaders =
      typeof request.headers === 'string' ? JSON.parse(request.headers) : request.headers || {};
    const parsedBody =
      typeof request.body === 'string' ? JSON.parse(request.body) : request.body || null;
  
    // Заполняем форму данными из выбранного запроса
    setApiUrl(request.url);
    setMethod(request.method);
    setHeaders(JSON.stringify(parsedHeaders, null, 2));
    setBody(JSON.stringify(parsedBody, null, 2));
    setQueryParams(request.queryParams || []);
    setAuth(request.auth || { type: 'none', token: '' });
    setAssertions(request.assertions || []);
  
    // Устанавливаем результаты запроса
    setResponse({
      data: request.response?.body,
      status: request.response?.status,
      headers: request.response?.headers,
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            API
          </Typography>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.mode === 'dark' ? '#1976d2' : '#1976d2',
            },
            '& .MuiTab-root': {
              color: theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
              backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#fff',
            },
            '& .Mui-selected': {
              color: theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
            },
          }}
        >
          <Tab label="Запрос" />
          <Tab label="Ответ" />
          <Tab label="История" />

        </Tabs>

        {activeTab === 0 && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <ApiInput value={apiUrl} onChange={handleApiUrlChange} />
            <MethodSelector value={method} onChange={handleMethodChange} />
            <HeadersInput value={headers} onChange={handleHeadersChange} />
            <BodyInput value={body} onChange={handleBodyChange} />
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Дополнительные настройки</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <QueryParamsInput onChange={handleQueryParamsChange} />
                <AuthInput onChange={handleAuthChange} />
                <EnvironmentVariables onChange={handleEnvVariablesChange} />
                <AssertionsInput onChange={handleAssertionChange} />
              </AccordionDetails>
            </Accordion>
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
              Отправить запрос
            </Button>
          </Paper>
        )}

        {activeTab === 1 && response && <ResponseDisplay response={response} />}

        {activeTab === 2 && (
          <RequestHistory
            requests={requestHistory}
            onReuseRequest={handleReuseRequest} // Передаем функцию для загрузки запроса
          />
        )}


      </Container>
    </ThemeProvider>
  );
};

export default RequestForm;