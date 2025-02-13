// components/Response/RequestHistory.js

import React, { useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button, Box } from '@mui/material';

const RequestHistory = ({ requests, onReuseRequest }) => {
  const [page, setPage] = useState(1); // Текущая страница
  const itemsPerPage = 5; // Количество запросов на странице

  // Разделяем запросы на страницы
  const paginatedRequests = requests.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        История запросов:
      </Typography>
      <List>
        {paginatedRequests.map((req) => (
          <ListItem
            key={req._id}
            button
            onClick={() => onReuseRequest(req)} // Вызываем обработчик при клике
          >
            <ListItemText
              primary={`${req.method.toUpperCase()} - ${req.url}`}
              secondary={new Date(req.timestamp).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>

      {/* Пагинация */}
      {requests.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 1} // Отключаем кнопку "Назад" на первой странице
          >
            Назад
          </Button>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page * itemsPerPage >= requests.length} // Отключаем кнопку "Вперед" на последней странице
          >
            Вперед
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default RequestHistory;