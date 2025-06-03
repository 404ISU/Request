import axios from 'axios';

// Вспомогательная функция, которая возвращает значение cookie по имени
function getCookieValue(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Добавляем перехватчик запросов
axios.interceptors.request.use((config) => {
  // Предположим, ваш JWT лежит в куке под именем "token"
  const token = getCookieValue('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axios;
