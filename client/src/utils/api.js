import axios from 'axios';


const api = axios.create({
  baseURL: 'htttp://localhost:5001/api',
  withCreadentials: true,
});

api.interceptors.request.use((config)=>{
  const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
},(error)=>{
  return Promise.reject(error)
})

export default api;