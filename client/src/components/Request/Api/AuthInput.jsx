import React, {useState} from 'react';
import {Select, MenuItem, TextField, FormControl, InputLabel} from '@mui/material';


const AuthInput = ({onChange})=>{
  const [authType, setAuthType]=useState('none');
  const [token, setToken]=useState('');

  const handleAuthTypeChange = (e)=>{
    setAuthType(e.target.value);
    onChange({type: e.target.value, token});
  };

  const handleTokenChange = (e)=>{
    setToken(e.target.value);
    onChange({type: authType, token: e.target.value});
  };

  return (
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel>
        Authorization
      </InputLabel>
      <Select value={authType} onChange={handleAuthTypeChange} label="Authorization">
        <MenuItem value="none">None</MenuItem>
        <MenuItem value="bearer">Bearer Token</MenuItem>
        <MenuItem value="basic">Basic Auth</MenuItem>
      </Select>
      {authType !== 'none' &&(
        <TextField label={authType === 'bearer' ? 'Token' : 'Username:Password'} value={token} onChange={handleTokenChange}
        fullWidth
        margin="normal"
        variant="outlined"
        />
      )}
    </FormControl>
  );
};

export default AuthInput;