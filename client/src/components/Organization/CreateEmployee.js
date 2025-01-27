import React, {useState} from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';

const CreateEmployee = ({organizationId })=>{
  const [formData, setFormData]=useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
  });


  const handleSubmit=async(e)=>{
    e.preventDefault();

    try {
      const response = await axios.post('/api/organization/employees', {
        ...formData, organizationId,
      });
      console.log(response.data);
      alert('Работник успешно создан');
    } catch (error) {
      console.error(error.response.data);
      alert('Ошибка при создании работника');
    }
  };

  const handleChange = (e)=>{
    const {name, value}=e.target;
    setFormData({...formData, [name]: value});
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
      name='username'
      label='Логин'
      value={formData.username}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
      />

      <TextField
      name="email"
      label="Email"
      type="email"
      value={formData.email}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
      />
      <TextField
      name="password"
      label="Пароль"
      type="password"
      value={formData.password}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
      />
      <TextField
      name="firstName"
      label="Имя"
      value={formData.firstName}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
      />
      <TextField
      name="lastName"
      label="Фамилия"
      value={formData.lastName}
      onChange={handleChange}
      fullWidth
      margin="normal"
      require
      />
      <TextField
      name="middleName"
      label="Отчество"
      value={formData.middleName}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
      />
      <TextField
      name="phone"
      label="Телефон"
      value={formData.phone}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
      />
      <Button type="submit" variant="contained" fullWidth sx={{mt:2}}>Создать работника</Button>
    </form>
  )
}

export default CreateEmployee;