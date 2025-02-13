import React, { useState } from "react";
import axios from "axios";
import {toast} from 'react-hot-toast';
import { useNavigate } from "react-router-dom";


export default function Login(){
  const navigate = useNavigate();
  const [data, setData] = useState({
    username: '',
    password: '',
  });

  const loginUser = async(e)=>{
    e.preventDefault();
    const {username, password} =data
    try {
      const {data}= await axios.post('/login', {
        username,
        password,
      })
      if(data.error){
        toast.error(data.error);
      }else{
        setData({});
        toast.success('Вход прошел успешно!')
        navigate('/')
      }
    } catch (error) {
      console.error(error)
    }
  };
  return (
    <div>
      <form onSubmit={loginUser}>
        <label>Логин</label>
        <input type="text" placeholder="Введите логин" value={data.username} onChange={(e)=>setData({...data, username: e.target.value})}/>
        <label>Пароль</label>
        <input type="password" placeholder="Введите пароль" value={data.password} onChange={(e)=>setData({...data, password: e.target.value})}/>
        <button type="submit">Вход</button>
      </form>
    </div>
  );
}
