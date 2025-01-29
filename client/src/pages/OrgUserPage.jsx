import React, {useEffect, useState} from 'react';
import {Box, Button} from '@mui/material';
import { useAuthState } from '../stores/authState';
import UserList from '../components/User/UserList';
import UserForm from '../components/User/UserForm';
import {Modal} from '@mui/material';


const OrgUsersPage=()=>{
  const {fetchOrganizationUsers, organizationUsers, createUser, updateUser, deleteUser, clearError} = useAuthState();
  const [modalOpen, setModalOpen]=useState(false);
  const [editUser, setEditUser]=useState(null)

  useEffect(()=>{
    fetchOrganizationUsers();
  }, [fetchOrganizationUsers]);


  const handleOpenModal = ()=>{
    setModalOpen(true);
    setEditUser(null);
  }

  const handleCloseModal = ()=>{
    setModalOpen(false);
    setEditUser(null);
  }

  const handleCreateUser = async (userData)=>{
    await createUser(userData);
    handleCloseModal();
  }

  const handleEditUser=(user)=>{
    setEditUser(user);
    setModalOpen(true);
  }

  const handleUpdateUser = async (userData)=>{
    await updateUser(editUser._id, userData)
    handleCloseModal();
  }

  const handleDeleteUser = async (id)=>{
    await deleteUser(id);
  }


  const handleFormSubmit = async (userData)=>{
    if(editUser){
      await handleUpdateUser(userData);
    }else{
      await handleCreateUser(userData);
    }
  }


  return (
    <Box sx={{p:3, textAlign: 'center'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb:2}}>
      <Button variant='contained' color="primary" onClick={handleOpenModal}>
        Create User
      </Button>
      </Box>
      <UserList users={organizationUsers} onEdit={handleEditUser} onDelete={handleDeleteUser}/>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p:4}}>
          <UserForm onSubmit={handleFormSubmit} user={editUser}/>
        </Box>
      </Modal>
    </Box>
  )
}

export default OrgUsersPage;