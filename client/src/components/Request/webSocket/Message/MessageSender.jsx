import React, { useState } from 'react';
import {
  Box, Button, FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';
import { Send } from '@mui/icons-material';
import Editor from '@monaco-editor/react';

export default function MessageSender({ connectionId, onSendMessage }) {
  const [format, setFormat] = useState('text');
  const [text, setText] = useState('');

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <FormControl fullWidth sx={{ mb: 2 }} size="small">
        <InputLabel>Формат</InputLabel>
        <Select value={format} label="Формат" onChange={e => setFormat(e.target.value)}>
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="json">JSON</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ flex: 1, mb: 2 }}>
        {format === 'text' ? (
          <TextField
            fullWidth
            multiline
            minRows={6}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        ) : (
          <Editor
            height="200px"
            language={format}
            value={text}
            onChange={v => setText(v)}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        )}
      </Box>

      <Button
        variant="contained"
        startIcon={<Send />}
        fullWidth
        onClick={() => {
          onSendMessage({ connectionId, content: text });
          setText('');
        }}
      >
        Отправить
      </Button>
    </Box>
  );
}
