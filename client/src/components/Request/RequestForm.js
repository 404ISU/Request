import React, { useState, useEffect } from 'react';
import ApiInput from './Api/ApiInput';
import MethodSelector from './Api/MethodSelector';
import HeadersInput from './Api/HeadersInput';
import BodyInput from './Api/BodyInput';
import RequestHistory from './Response/RequestHistory';
import ResponseDisplay from './Response/ResponseDisplay';
import axios from 'axios';

const RequestForm = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [method, setMethod] = useState('get');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('{}');
  const [requestHistory, setRequestHistory] = useState([]);
  const [response, setResponse] = useState(null);

  const handleApiUrlChange = (e) => setApiUrl(e.target.value);
  const handleMethodChange = (e) => setMethod(e.target.value);
  const handleHeadersChange = (e) => setHeaders(e.target.value);
  const handleBodyChange = (e) => setBody(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsedHeaders = JSON.parse(headers);
      const parsedBody = body ? JSON.parse(body) : null;

      const response = await axios.post('http://localhost:5001/api/requests/makeRequest', {
        url: apiUrl,
        method,
        headers: parsedHeaders,
        body: parsedBody,
      });
      setResponse(response.data);
    } catch (error) {
      setResponse(error.response?.data || { error: 'Request failed' });
    }
    fetchHistory();
  };

  const fetchHistory = async () => {
    try {
      const historyResponse = await axios.get('http://localhost:5001/api/requests/history');
      setRequestHistory(historyResponse.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <ApiInput value={apiUrl} onChange={handleApiUrlChange} />
      <MethodSelector value={method} onChange={handleMethodChange} />
      <HeadersInput value={headers} onChange={handleHeadersChange} />
      <BodyInput value={body} onChange={handleBodyChange} />
      <button type="submit">Send Request</button>
      <RequestHistory requests={requestHistory} />
      {response && <ResponseDisplay response={response} />}
    </form>
  );
};

export default RequestForm;
