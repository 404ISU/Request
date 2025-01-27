import React, {useState} from 'react';
import {Select, MenuItem, TextField, Button, Box} from '@mui/material';


const AssertionsInput = ({onChange})=>{
  const [assertions, setAssertions] =useState([{type: 'status', expected: ''}]);

  const handleAssertionChange = (index, field, value)=>{
    const newAssertions = [...assertions];
    newAssertions[index][field]=value;
    setAssertions(newAssertions);
    onChange(newAssertions.filter((assertions)=>assertions.expected));
  };

  const addAssertion = ()=>{
    setAssertions([...assertions, {type: 'staatus', expected: ''}]);
  };

  return(
    <Box>
      {assertions.map((assertion, index)=>(
        <Box key={index} sx={{display: 'flex', gap:2, mb:2}}>
          <Select value={assertion.type}
          onChange={(e)=> handleAssertionChange(index, 'type', e.target.value)}
          fullWidth
          variant="outlined"
          >
            <MenuItem value="status">Status Code</MenuItem>
            <MenuItem value="body">Body Contains</MenuItem>
          </Select>
          <TextField label="Expected Value" value={assertion.expected} onChange={(e)=>handleAssertionChange(index, 'expected', e.target.value)}
            fullWidth
            variant="outlined"/>
        </Box>
      ))}
      <Button onClick={addAssertion} variant="outlined">
        Добавить оператор
      </Button>
    </Box>
  )
}

export default AssertionsInput;