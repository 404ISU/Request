import React, {useContext} from 'react';
import { UserContext } from '../context/userContext';

export default function Dashboard()
{
  const {user}=useContext(UserContext)
  return (
    <div>
      <h1>Панель управления</h1>
      <>
            {!!user && (<h1>Здравствуйте {user.name}</h1>)}
      </>

    </div>
  )
}

