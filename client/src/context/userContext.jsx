// context/userContext.js

import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Метод для входа
  const login = (userData) => {
    console.log('Вызов метода login:', userData); // Отладка: проверяем, что данные приходят
    setUser(userData); // Обновляем данные пользователя
    setLoading(false);
  };

  // Метод для выхода
  const logout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null); // Очищаем данные пользователя
    setLoading(false);
  };

  // Проверка авторизации при загрузке сайта
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1];
        if (token) {
          const response = await axios.get('/profile', { withCredentials: true });
          
          // Исправлено: проверка структуры ответа
          if (response.data && response.data?.user) {
            login(response.data.user);
          } else {
            console.error('Некорректный формат ответа:', response.data);
            logout();
          }
        }
      } catch (error) {
        console.error('Ошибка при авторизации:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}