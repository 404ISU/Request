import React, { useState } from 'react';
import { 
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Button
} from '@mui/material';
import PropTypes from 'prop-types';
import ResponseDisplay from './ResponseDisplay';

const RequestHistory = ({ requests, onReuseRequest }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Обработчик выбора элемента истории
  const handleSelect = (request) => {
    try {
      // Парсим данные ответа
      const responseData = request.response?.body 
        ? JSON.parse(request.response.body)
        : {};

      // Формируем объект для передачи
      const requestData = {
        ...request,
        response: {
          ...request.response,
          body: responseData
        }
      };

      setSelectedRequest(request);
      onReuseRequest(requestData); // Передаем полные данные
      
    } catch (error) {
      console.error('Ошибка выбора запроса:', error);
      onReuseRequest({
        error: 'Не удалось загрузить запрос из истории'
      });
    }
  };

  // Пагинация
  const paginatedRequests = requests.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        История запросов ({requests.length})
      </Typography>

      <List>
        {paginatedRequests.map((request) => (
          <ListItem
            key={request._id}
            button
            onClick={() => handleSelect(request)}
            selected={selectedRequest?._id === request._id}
            sx={{
              '&:hover': { backgroundColor: '#f5f5f5' },
              transition: 'background-color 0.3s'
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body1" fontWeight="bold">
                  {`${request.method} ${new URL(request.url).origin + new URL(request.url).pathname}`}
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {new Date(request.timestamp).toLocaleString()} |
                  {/* Params: {new URL(request.url).searchParams.toString() || 'none'} */}
                  Status: {request.response?.status || 'N/A'} | 
                  Latency: {request.response?.latency || 0}ms
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Отображение ответа */}
      {selectedRequest?.response && (
        <Box sx={{ mt: 2 }}>
          <ResponseDisplay 
            data={selectedRequest.response.body}
            status={selectedRequest.response.status}
            headers={selectedRequest.response.headers}
            latency={selectedRequest.response.latency}
          />
        </Box>
      )}

      {/* Пагинация */}
      {requests.length > itemsPerPage && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 2,
          gap: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            fullWidth
          >
            Назад
          </Button>
          <Button
            variant="outlined"
            onClick={() => setPage(page + 1)}
            disabled={page * itemsPerPage >= requests.length}
            fullWidth
          >
            Вперед
          </Button>
        </Box>
      )}
    </Paper>
  );
};

RequestHistory.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      method: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      response: PropTypes.shape({
        status: PropTypes.number,
        body: PropTypes.any,
        headers: PropTypes.object,
        latency: PropTypes.number
      })
    })
  ).isRequired,
  onReuseRequest: PropTypes.func.isRequired
};

export default RequestHistory;