import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Tabs,
  Tab,
  Button,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApiInput from './Api/ApiInput';
import MethodSelector from './Api/MethodSelector';
import HeadersInput from './Api/HeadersInput';
import BodyInput from './Api/BodyInput';
import AssertionsInput from './Api/AssertionsInput';
import ResponseDisplay from './Response/ResponseDisplay';
import RequestHistory from './Response/RequestHistory';
import axios from 'axios';
import AuthInput from './Api/AuthInput';
import QueryParamsInput from './Api/QueryParamsInput';
import EnvironmentVariables from './Api/EnvironmentVariables';

const RequestForm = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [queryParams, setQueryParams] = useState('{}');
  const [auth, setAuth] = useState({ type: 'none', token: '' });
  const [envVars, setEnvVars] = useState([]);

  // Получение истории запросов
  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('/api/requests/history');
      setRequestHistory(data);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    const start = Date.now(); // Фиксируем время начала

    try {
      // Парсим все параметры
      const parsedHeaders = JSON.parse(headers);
      const parsedBody = JSON.parse(body);
      const parsedQuery = typeof queryParams === 'string' 
      ? JSON.parse(queryParams)
      : queryParams;

      // Добавляем авторизацию в заголовки
      if (auth.type === 'bearer') {
        parsedHeaders['Authorization'] = `Bearer ${auth.token}`;
      } else if (auth.type === 'basic') {
        parsedHeaders['Authorization'] = `Basic ${btoa(auth.token)}`;
      }

      // Заменяем переменные окружения в URL
      let finalUrl = apiUrl;
      envVars.forEach(({ key, value }) => {
        finalUrl = finalUrl.replace(`{{${key}}}`, value);
      });

      // Формируем URL с query-параметрами
      const urlObj = new URL(apiUrl);
      if (parsedQuery && typeof parsedQuery === 'object') {
        Object.entries(parsedQuery).forEach(([key, value]) => {
          if (key && value !== undefined) {
            urlObj.searchParams.append(key, value);
          }
        });
      }

      // Отправляем запрос
      const result = await axios.post('/api/requests/makeRequest', {
        method: method.toUpperCase(),
        url: urlObj.toString(),
        headers: parsedHeaders,
        data: method.toUpperCase() === 'GET' ? undefined : parsedBody
      });

      // Обновляем состояние ответа
      setResponse({
        data: result.data.data,
        status: result.data.status,
        headers: result.data.headers,
        latency: result.data.latency,
        timestamp: new Date().toISOString()
      });

      await fetchHistory();

    } catch (error) {
      console.error('Ошибка запроса:', error);
      setResponse({
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        latency: Date.now() - start,
        data: error.response?.data
      });
    }
  };




  // Обработчик выбора из истории
  const handleReuseRequest = (request) => {
    try {
      const urlObj = new URL(request.url);
      const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
      const queryParamsFromUrl = Object.fromEntries(urlObj.searchParams.entries());

      let responseBody = {};
      if (request.response?.body) {
        // Проверяем тип данных перед парсингом
        responseBody = typeof request.response.body === 'string' 
          ? JSON.parse(request.response.body) 
          : request.response.body;
      }
  
      setApiUrl(baseUrl);
      setMethod(request.method);
      setQueryParams(JSON.stringify(queryParamsFromUrl, null, 2));
  
      const headersValue = typeof request.headers === 'string' 
        ? request.headers 
        : JSON.stringify(request.headers || {}, null, 2);
      setHeaders(headersValue);
  
      const bodyValue = typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body || {}, null, 2);
      setBody(bodyValue);
  
      setResponse({
        data: responseBody,
        status: request.response?.status || 200,
        headers: request.response?.headers || {},
        latency: request.response?.latency || 0
      });
  
      setTimeout(() => setActiveTab(0), 0);
    } catch (error) {
      console.error('Ошибка восстановления запроса:', error);
      setResponse({
        error: 'Ошибка загрузки данных из истории',
        data: {}
      });
    }
  };
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Tabs value={activeTab} onChange={(_, newVal) => setActiveTab(newVal)}>
        <Tab label="Новый запрос" />
        <Tab label="История" />
        <Tab label="Настройки" />
      </Tabs>

      {activeTab === 0 ? (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <ApiInput value={apiUrl} onChange={setApiUrl} />
          <MethodSelector value={method} onChange={setMethod} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Дополнительные параметры</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AuthInput onChange={setAuth} />
              <HeadersInput value={headers} onChange={setHeaders} />
              <QueryParamsInput onChange={setQueryParams} />
              <BodyInput value={body} onChange={setBody} />
              <EnvironmentVariables onChange={setEnvVars} />
              <AssertionsInput onChange={setAssertions} />
            </AccordionDetails>
          </Accordion>

          <Button 
            fullWidth 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={handleSubmit}
          >
            Отправить запрос
          </Button>

          {response && (
            <Box sx={{ mt: 2 }}>
              <ResponseDisplay 
                data={response.data}
                status={response.status}
                headers={response.headers}
                latency={response.latency}
                error={response.error}
              />
            </Box>
          )}
        </Paper>
      ) : activeTab === 1 ? (
        <RequestHistory 
          requests={requestHistory}
          onReuseRequest={handleReuseRequest}
        />
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <EnvironmentVariables onChange={setEnvVars} />
        </Paper>
      )}
    </Container>
  );
};

export default RequestForm;