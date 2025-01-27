import React, {useState, useEffect} from 'react';
import axios from 'axios';

const AdminPanel = ()=>{
  const [users, setUsers]=useState([]);

  // Загрузка всех пользователей
  useEffect(()=>{
    const fetchUsers = async () =>{
      try {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error(error.response.data);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId)=>{
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter((user)=>user._id !== userId));
    } catch (error) {
      console.error(error.response.data)
    }
  };


  return(
    <div>
      <h2>Панель администратора</h2>
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user)=>(
            <tr key={user._id}>
              <td>{user.personalData.name} {user.personalData.firstName} {user.personalData.lastName}</td>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={()=> handleDeleteUser(user._id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


export default AdminPanel;