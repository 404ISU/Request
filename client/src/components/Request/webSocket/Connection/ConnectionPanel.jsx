import React, { useState } from 'react';
import {
  Paper, Box, Typography, Button, Tabs, Tab
} from '@mui/material';
import { Link as LinkOn, LinkOff } from '@mui/icons-material';
import MessageList from '../Message/MessageList';
import MessageSender from '../Message/MessageSender';
import ConnectionSettings from './ConnectionSettings';
import { v4 as uuidv4 } from 'uuid';

export default function ConnectionPanel({
  connection,
  onConnect,
  onDisconnect,
  onUpdate,
  onRemove,
  isConnecting
}) {
  const [tab, setTab] = useState('message');

  return (
    <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box>
          <Typography variant="h6">{connection.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {connection.url}
          </Typography>
        </Box>
        {connection.status === 'connected' ? (
          <Button
            variant="contained"
            color="error"
            onClick={() => onDisconnect(connection.id)}
          >
            <LinkOff /> Отключить
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={() => onConnect(connection.id)}
            disabled={isConnecting}
          >
            <LinkOn /> {isConnecting ? 'Соединяюсь…' : 'Подключить'}
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Сообщения" value="message" />
        <Tab label="Настройки" value="settings" />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tab === 'message' ? (
          <MessageList messages={connection.messages} />
        ) : (
          <ConnectionSettings
            connection={connection}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        )}
      </Box>
      {tab === 'message' && (
        <MessageSender
          connectionId={connection.id}
          onSendMessage={({ content }) => {
            connection.ws?.send(content);
            // лог + ui
            const msg = {
              id: uuidv4(),
              content,
              direction: 'OUTGOING',
              timestamp: Date.now(),
              type: (() => {
                try { JSON.parse(content); return 'json'; }
                catch { return content.startsWith('<') ? 'xml' : 'text'; }
              })()
            };
            onUpdate({
              ...connection,
              messages: [...connection.messages, msg]
            });
          }}
        />
      )}
    </Paper>
  );
}
