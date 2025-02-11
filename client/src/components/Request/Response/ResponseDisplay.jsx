import React from 'react';
import { Paper, Typography } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ResponseDisplay = ({ response }) => {
  if (!response) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
        Ответ
      </Typography>
      <SyntaxHighlighter language="json" style={docco}>
        {JSON.stringify(response, null, 2)}
      </SyntaxHighlighter>
    </Paper>
  );
};

export default ResponseDisplay;