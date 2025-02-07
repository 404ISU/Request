import axios from 'axios';
import {createContext, useState, useEffect} from 'react';

// созадние контекста
export const UserContext =createContext();

// проваайдер контекста
export function UserContextProvider({children}){
  const [user, setUser]=useState(null);
  const [loading, setLoading]= useState(true) // состояние загрузки


  // метод для входа
   const login = (userData)=>{
    setUser(userData);
    setLoading(false);
   };


  // метод для выхода 
  const logout = ()=>{
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
    setLoading(false);
  }

// проверка авторизации при загрузке сайта
  useEffect(()=>{
    const checkAuth = async()=>{
      try {
        const token = document.cookie.split('; ').find(row=> row.startsWith('token='))?.split('=')[1];

        if(token){
          const response =await axios.get('profile', {
            withCredentials: true,
          });
          login(response.data);
        }
      } catch (error) {
        console.error("Ошибка при авторизации ", error);
        logout();
        // выходим из аккаунта при ошибке
      }finally{
        setLoading(false);
      }
    }
    checkAuth();
  }, [])

  return(
    <UserContext.Provider value={{user,loading,login,logout, setUser}}>
      {children}
    </UserContext.Provider>
  )
}