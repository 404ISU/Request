import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';

axios.defaults.withCredentials = true;
const token = localStorage.getItem('token') || Cookies.get('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<QueryClientProvider client={queryClient}>
  <Router>
      <App />
  </Router>
</QueryClientProvider>
</React.StrictMode>
)