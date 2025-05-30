import React from 'react';
import { Box, Typography, Chip, List, ListItem, ListItemText } from '@mui/material';
import Editor from '@monaco-editor/react';

export default function MessageList({ messages }) {
  return (
    <Box sx={{ height: '100%', p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">Сообщения</Typography>
        <Chip label={`${messages.length}`} size="small" />
      </Box>
      <List sx={{ maxHeight: 'calc(100% - 40px)', overflow: 'auto' }}>
        {messages.map(m => (
          <ListItem key={m.id} sx={{ mb: 1, borderRadius: 1, bgcolor: m.direction === 'INCOMING' ? 'action.selected' : 'action.hover' }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {m.direction === 'INCOMING' ? 'Получено' : 'Отправлено'}
                  </Typography>
                  <Typography variant="caption">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              }
              secondary={
                m.type === 'json' || m.type === 'xml' ? (
                  <Editor
                    height="150px"
                    language={m.type}
                    value={
                      m.type === 'json'
                        ? JSON.stringify(JSON.parse(m.content), null, 2)
                        : m.content
                    }
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      scrollBeyondLastLine: false
                    }}
                  />
                ) : (
                  <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {m.content}
                  </Typography>
                )
              }
              secondaryTypographyProps={{ component: 'div' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
