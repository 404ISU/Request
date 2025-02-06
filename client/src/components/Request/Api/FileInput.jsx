import React, {useState} from 'react';
import {Button} from '@mui/material';
const FileInput = ({onChange})=>{

  const handleFileChange=(e)=>{
    const file = e.target.files[0];
    onChange(file);
  };

  return(
    <Button variant="outlined" component="label">
      Загрузить файл
      <input type="file" hidden onChange={handleFileChange} />
    </Button>
  )
}

export default FileInput;