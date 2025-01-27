import React, {useState} from 'react';
import { TextField, Button, Box } from '@mui/material';
const EnvironmentVariables = ({onChange})=>{
  const [variables, setVariables]=useState([{key: '', value: ''}]);

  const handleVariableChange = (index, field, value)=>{
    const newVariables = [...variables];
    newVariables[index][field]=value;
    setVariables(newVariables);
    onChange(newVariables.filter((variable)=> variable.key && variable.value));
  };


  const addVariable = ()=>{
    setVariables([...variables, {key: '', value: ''}]);
  }


  return (
    <Box>
      <label>Переменные окружения:</label>
      {variables.map((variable, index)=>(
        <Box key={index} sx={{display: 'flex', gap:2, mb:2}}>
          <TextField
          label="Key"
          value={variable.key}
          onChange={(e)=> handleVariableChange(index, 'key', e.target.value)}
          fullWidth
          variant="outlined"
          />
          <TextField
          label="Value"
          value={variable.value}
          onChange={(e)=>handleVariableChange(index, 'value', e.target.value)}
          fullWidth
          variant="outlined"
          />
        </Box>
      ))}
      <Button onClick={addVariable} variant="outlined">Добавить переменную
        
      </Button>
    </Box>
  )
}

export default EnvironmentVariables;