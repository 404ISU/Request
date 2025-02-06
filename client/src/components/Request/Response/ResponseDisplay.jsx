import React from 'react';
import {Paper, Typography} from '@mui/material'
const ResponseDisplay = ({ response }) => {
  if(!response) return null;

  return (
    <Paper elevation={3} sx={{p:3, mb:3, backgroundColor: 'background.paper'}}>
    <Typography  variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
      Ответ
    </Typography>
    <Typography variant="body1" sx={{ color: 'text.primary' }}>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </Typography>

    </Paper>
  );
};

export default ResponseDisplay;