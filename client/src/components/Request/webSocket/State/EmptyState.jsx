import React, { useState } from 'react';
import {
  Box, Button, Paper, Typography,
  Divider, TextField, InputAdornment, List, ListItem, ListItemText
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';

export default function EmptyState({ onCreateConnection, connectionHistory }) {
  const [search, setSearch] = useState('');
  const filtered = connectionHistory.filter(
    h =>
      h.url.toLowerCase().includes(search) ||
      (h.name && h.name.toLowerCase().includes(search))
  );

  return (
    <Paper
      sx={{
        flex: 1,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography gutterBottom>Нет соединений</Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onCreateConnection}
      >
        Создать
      </Button>
      {connectionHistory.length > 0 && (
        <>
          <Divider sx={{ my: 3, width: '100%' }} />
          <TextField
            placeholder="Поиск"
            value={search}
            onChange={e => setSearch(e.target.value.toLowerCase())}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <List sx={{ maxHeight: 200, overflow: 'auto', width: '100%' }}>
            {filtered.map(h => (
              <ListItem
                button
                key={h.id}
                onClick={() => onCreateConnection(h)}
              >
                <ListItemText primary={h.name || h.url} secondary={h.url} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
}
