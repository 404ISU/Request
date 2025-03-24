// RequestForm.jsx
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
  useTheme
} from '@mui/material';
import {
  SendRounded,
  HistoryRounded,
  SettingsRounded,
  CodeRounded,
  ContentCopyRounded,
  ReplayRounded,
  ExpandMoreRounded
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import ApiInput from './Api/ApiInput';
import MethodSelector from './Api/MethodSelector';
import HeadersInput from './Api/HeadersInput';
import BodyInput from './Api/BodyInput';
import ResponseDisplay from './Response/ResponseDisplay';
import RequestHistory from './Response/RequestHistory';
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
  const [expandedSection, setExpandedSection] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [requestHistory, setRequestHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('requestHistory') || '[]');
    } catch {
      return [];
    }
  });
  const [queryParams, setQueryParams] = useState('{}');
  const [auth, setAuth] = useState({ type: 'none', token: '' });
  const [envVars, setEnvVars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    request: true,
    advanced: false
  });

  useEffect(() => {
    localStorage.setItem('requestHistory', JSON.stringify(requestHistory));
  }, [requestHistory]);

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

      setRequestHistory(prev => [newRequest, ...prev.slice(0, 49)]);
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


  return (
    <Container maxWidth="xl" sx={{ py: 4, height: '100vh' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Левая панель - Конфигурация */}
        <Grid item xs={12} md={5} lg={5} sx={{ height: '100%' }}>
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
                label="Request" 
                icon={<CodeRounded fontSize="small" />} 
                sx={{ minHeight: 48 }}
              />
              <Tab 
                label="History" 
                icon={<HistoryRounded fontSize="small" />} 
                sx={{ minHeight: 48 }}
              />
              <Tab 
                label="Settings" 
                icon={<SettingsRounded fontSize="small" />} 
                sx={{ minHeight: 48 }}
              />
            </Tabs>

            {activeTab === 0 ? (
              <Stack spacing={3} sx={{ flex: 1 }}>
                <SectionHeader
                  title="Request Setup"
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
                        />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1 }} />

                    <SectionHeader
                      title="Advanced Options"
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
                  {loading ? 'Processing...' : 'Execute Request'}
                </AnimatedButton>
              </Stack>
            ) : activeTab === 1 ? (
              <RequestHistory 
                requests={requestHistory}
                onReuseRequest={(request) => {
                  setApiUrl(request.url);
                  setMethod(request.method);
                  setHeaders(JSON.stringify(request.headers, null, 2));
                  setBody(JSON.stringify(request.body || null, null, 2));
                  setQueryParams(JSON.stringify(request.query, null, 2));
                  setResponse(request.response);
                  setActiveTab(0);
                }}
              />
            ) : (
              <EnvironmentVariables 
                variables={envVars} 
                onChange={setEnvVars} 
              />
            )}
          </StyledPaper>
        </Grid>

        {/* Правая панель - Ответ */}
        <Grid item xs={12} md={7} lg={7} sx={{ height: '100%' }}>
          <StyledPaper sx={{ p: 0 }}>
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1} 
              sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
            >
              <Typography variant="subtitle1" fontWeight={600}>Response</Typography>
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
              <IconButton 
                size="small" 
                sx={{ ml: 'auto' }}
                onClick={() => navigator.clipboard.writeText(JSON.stringify(response))}
              >
                <ContentCopyRounded fontSize="small" />
              </IconButton>
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
                <Typography variant="body2">Send a request to view response</Typography>
              </Stack>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RequestForm;