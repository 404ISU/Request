import React, { useState } from 'react';
import {
  Box, Button, FormGroup, FormControlLabel,
  Switch, TextField
} from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function ConnectionSettings({ connection, onUpdate, onRemove }) {
  const [wordWrap, setWordWrap] = useState(true);

  return (
    <Box sx={{ p: 2 }}>
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={wordWrap} onChange={e => setWordWrap(e.target.checked)} />}
          label="Word Wrap"
        />
        <FormControlLabel
          control={
            <Switch
              checked={connection.saveMessages}
              onChange={e => onUpdate({ ...connection, saveMessages: e.target.checked })}
            />
          }
          label="Сохранять сообщения"
        />
      </FormGroup>
      <TextField
        fullWidth
        label="Имя"
        sx={{ mt: 2 }}
        value={connection.name}
        onChange={e => onUpdate({ ...connection, name: e.target.value })}
      />
      <TextField
        fullWidth
        label="URL"
        sx={{ mt: 2 }}
        value={connection.url}
        onChange={e => onUpdate({ ...connection, url: e.target.value })}
      />
      <Button
        variant="outlined"
        startIcon={<Delete />}
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => onRemove(connection.id)}
      >
        Удалить
      </Button>
    </Box>
  );
}
