import React, {useState, useEffect} from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';


export default function UserProfile(){
  const [user, setUser]=useState(null);
  const [updatedUser, setUpdatedUser]=useState({
    username: '',
    email: '',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
  });


  // загрузка профиля пользователя
  const fetchProfile = async ()=>{
    try {
      const response = await axios.get('/profile');
      setUser(response.data);
      setUpdatedUser({
        username: response.data.username,
        email: response.data.email,
        name: response.data.name || '',
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
      })
    } catch (error) {
      toast.error('ошибка при загрузке профиля')
    }
  };

  useEffect(()=> {
    fetchProfile();
  }, []);

  // обновление профелия
  const handleUpdateProfile = async ()=>{
    try {
    await axios.put('/update-profile', updatedUser);
    toast.success('Профиль успешно обновлен');
    fetchProfile(); // обновление данных после изменений
    } catch (error) {
      toast.error('Ошибка при обновлении профиля')
    }
  };

  if(!user) return <div>Загрузка...</div>

  return (
    <div>
      <h2>Личный кабинет</h2>


      <h3>Текущие данные:</h3>
      <p>Логин: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Имя: {user.name}</p>
      <p>Фамилия: {user.firstName }</p>
      <p>Отчество: {user.lastName}</p>

      <h3>Редактирование профиля:</h3>
      <input type="text" placeholder='Логин' value={updatedUser.username} onChange={(e)=>setUpdatedUser({...updatedUser, username: e.target.value})}/>
      <input type="email" placeholder='Email' value={updatedUser.email} onChange={(e)=>setUpdatedUser({...updatedUser, email: e.target.value})}/>
      <input type="password" placeholder='Новый пароль (оставьте пустым, если не меняете)' value={updatedUser.password} onChange={(e)=>setUpdatedUser({...updatedUser, password: e.target.value})}/>
      <input type="text" placeholder='Имя' value={updatedUser.name} onChange={(e)=>setUpdatedUser({...updatedUser, name: e.target.value})}/>
      <input type="text" placeholder='Фамилия' value={updatedUser.firstName} onChange={(e)=>setUpdatedUser({...updatedUser, firstName: e.target.value})}/>
      <input type="text" placeholder='Отчество' value={updatedUser.lastName} onChange={(e)=>setUpdatedUser({...updatedUser, lastName: e.target.value})}/>
      <button onClick={handleUpdateProfile}>Сохранить изменение</button>
    </div> 
  )
}