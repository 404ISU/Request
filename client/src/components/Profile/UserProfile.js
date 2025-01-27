import React, {useState, useEffect} from 'react';
import axios from 'axios';

const UserProfile = ()=>{
  const [user, setUser]=useState(null);
  const [formData, setFormData]=useState({
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
  });


  useEffect(()=>{
    const fetchUser =async()=>{
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
        setFormData({
          name: response.data.personalData.name,
          firstName: response.data.personalData.firstName,
          lastName: response.data.personalData.lastName,
          phone: response.data.personalData.phone,
        });
      } catch (error) {
        console.error(error.response.data);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try {
      const response = await axios.put('/api/auth/update', formData);
      setUser(response.data);
      alert('Profile updated successfully');
    } catch (error) {
      console.error(error.resposne.data);
    }
  };


  return(
    <div>
      <h2>
        Личный кабинет
      </h2>
      {user && (
        <form onSubmit={handleSubmit}>
          <input
          type='text'
          placeholder='Имя'
          value={formData.name}
          onChange={(e)=>setFormData({...formData, name: e.target.value})}/>
          <input
          type='text'
          placeholder="Фамилия"
          value={formData.firstName}
          onChange={(e)=>setFormData({...formData, firstName: e.target.value})}
          />
          <input type='text' placeholder='Отчество'
          value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName: e.target.value})}/>
          <input type="text" placeholder='Телефон' 
          value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})}/>
          <button type="submit">Сохранить</button>
        </form>
      )}
    </div>
  )
}

export default UserProfile;