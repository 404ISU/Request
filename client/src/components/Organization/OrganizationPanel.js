import React, {useState, useEffect} from 'react';
import axios from 'axios';

const OrganizationPanel=()=>{
  const [employees, setEmployees]=useState([]);

  // загрузить работников организации
  useEffect(()=>{
    const fetchEmployees =async()=>{
      try {
        const response =await axios.get('api/organization/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error(error.response.data);
      }
    };
    fetchEmployees();
  }, []);


  return(
    <div>
      <h2>Панель Организации</h2>
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee)=>(
            <tr key={employee._id}>
              <td>{employee.personalData.name} {employee.personalData.firsName}
              {employee.personalData.lastName}
              </td>
              <td>{employee.email}</td>
              <td>{employee.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrganizationPanel;