import React from "react";
import {useState} from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {useNavigate} from 'react-router-dom'
export default function Register(){
  const navigate = useNavigate();
  const [data, setData]=useState({
    name: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationAddress: '',
    organizationPhone: '',

  });

  const registerUser = async(e)=>{
    e.preventDefault();
    const {username, email, password,confirmPassword,name, firstName, lastName, organizationName, organizationAddress, organizationPhone}=data
    try {
      const {data} = await axios.post('/register', {username, email, password,confirmPassword,name, firstName, lastName, organizationName, organizationAddress, organizationPhone})

      if(data.error){
        toast.error(data.error);
      }else{
        setData({})
        toast.success('Регистрация прошла успешно!')
        navigate('/login');
      }
    } catch (error) {
      console.error(error)
    }
  };

  return (
    <div>
      <form onSubmit={registerUser}>
        <label>Имя</label>
        <input type="text" placeholder="Введите имя" value={data.name} onChange={(e)=>setData({...data, name: e.target.value})}/>
        <label>Фамилия</label>
        <input type="text" placeholder="Введите фаимлию" value={data.firstName} onChange={(e)=>setData({...data, firstName: e.target.value})}/>
        <label>Отчество</label>
        <input type="text" placeholder="Введите отчество" value={data.lastName} onChange={(e)=>setData({...data, lastName: e.target.value})}/>
        <label>Логин</label>
        <input type="text" placeholder="Введите логин" value={data.username} onChange={(e)=>setData({...data, username: e.target.value})}/>
        <label>Email</label>
        <input type="email" placeholder="Введите email" value={data.email} onChange={(e)=>setData({...data, email: e.target.value})}/>
        <label>Пароль</label>
        <input type="password" placeholder="Введите пароль" value={data.password} onChange={(e)=>setData({...data, password: e.target.value})}/>       
        <label>Подтверждения пароля</label>
        <input type="password" placeholder="Введите повторно пароль" value={data.confirmPassword} onChange={(e)=>setData({...data, confirmPassword: e.target.value})}/>        
        <label>Название организации</label>
        <input type="text" placeholder="Введите название организации" value={data.organizationName} onChange={(e)=>setData({...data, organizationName: e.target.value})}/>        
        <label>Адрес организации</label>
        <input type="text" placeholder="Введите адрес организации" value={data.organizationAddress} onChange={(e)=>setData({...data, organizationAddress: e.target.value})}/>
        <label>Телефон организации</label>
        <input type="text" placeholder="Введите телефон организации" value={data.organizationPhone} on onChange={(e)=>setData({...data, organizationPhone: e.target.value})}/>
        <button type="submit">Регистрация</button>
      </form>
    </div>
  );
};


