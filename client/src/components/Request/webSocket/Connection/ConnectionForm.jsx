import React, { useState } from 'react';
import {
  Box, Button, Paper, Typography, Divider,
  TextField, List, ListItem, ListItemText, InputAdornment, IconButton
} from '@mui/material';
import { Close, Link, Search } from '@mui/icons-material';

export default function ConnectionForm({ onSubmit, onCancel, history }) {
  const [cfg, setCfg] = useState({
    name: '',
    url: 'wss://echo.websocket.org',
    protocols: [],
    autoConnect: false,
    saveMessages: true
  });
  const [search, setSearch] = useState('');

  const filtered = history.filter(
    h =>
      h.url.toLowerCase().includes(search) ||
      (h.name && h.name.toLowerCase().includes(search))
  );

  const apply = h =>
    setCfg({
      ...cfg,
      url: h.url,
      protocols: h.protocols,
      name: h.name
    });

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">Новое WS-соединение</Typography>
        <IconButton onClick={onCancel}>
          <Close />
        </IconButton>
      </Box>
      <TextField
        label="Имя"
        fullWidth
        value={cfg.name}
        onChange={e => setCfg({ ...cfg, name: e.target.value })}
        sx={{ mb: 2 }}
      />
      <TextField
        label="URL"
        fullWidth
        value={cfg.url}
        onChange={e => setCfg({ ...cfg, url: e.target.value })}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Link />
            </InputAdornment>
          )
        }}
      />
      <TextField
        label="Протоколы (comma)"
        fullWidth
        value={cfg.protocols.join(',')}
        onChange={e =>
          setCfg({
            ...cfg,
            protocols: e.target.value
              .split(',')
              .map(p => p.trim())
              .filter(Boolean)
          })
        }
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={() => onSubmit(cfg)}
      >
        Добавить соединение
      </Button>

      {history.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <TextField
            placeholder="Поиск истории"
            fullWidth
            value={search}
            onChange={e => setSearch(e.target.value.toLowerCase())}
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <List sx={{ maxHeight: 200, overflow: 'auto' }}>
            {filtered.map(h => (
              <ListItem button={true} key={h.id} onClick={() => apply(h)}>
                <ListItemText primary={h.name || h.url} secondary={h.url} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
}
