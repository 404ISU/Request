import React from 'react';
import {
  Paper, Typography, List, ListItem,
  ListItemText, IconButton, Box, Button
} from '@mui/material';
import { Delete, Add, Link as LinkOn, LinkOff } from '@mui/icons-material';

export default function ConnectionList({
  connections,
  activeConnectionId,
  onSelect,
  onRemove,
  onCreateConnection
}) {
  return (
    <Paper sx={{ width: 250, p: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ px: 1, fontWeight: 'bold' }}>Соединения</Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {connections.map(c => (
          <ListItem
            key={c.id}
            selected={c.id === activeConnectionId}
            button
            onClick={() => onSelect(c.id)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {c.status === 'connected' ? (
                    <LinkOn color="success" fontSize="small" sx={{ mr: 1 }} />
                  ) : (
                    <LinkOff color="disabled" fontSize="small" sx={{ mr: 1 }} />
                  )}
                  <Box
                    component="span"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {c.name}
                  </Box>
                </Box>
              }
              secondary={c.url}
            />
            <IconButton
              edge="end"
              size="small"
              onClick={e => {
                e.stopPropagation();
                onRemove(c.id);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={onCreateConnection}
        fullWidth
        sx={{ mt: 1 }}
      >
        Добавить
      </Button>
    </Paper>
  );
}
