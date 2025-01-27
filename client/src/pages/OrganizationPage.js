import React from 'react';
import OrganizationPanel from '../components/Organization/OrganizationPanel';
import CreateEmployee from '../components/Organization/CreateEmployee';

const OrganizationPage = ()=>{
  const organizationId= '...'; // ID организации(можно получить из контекста или состояния)

  return (
    <div>
      <h1>Панель организации</h1>
      <OrganizationPanel />
      <h2>Создать Работника</h2>
      <CreateEmployee  organizationId={organizationId}/>
    </div>
  )
}

export default OrganizationPage