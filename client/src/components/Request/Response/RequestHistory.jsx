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
  const [selectedRequest, setSelectedRequest] = useState(null);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        История Запросов ({requests.length})
      </Typography>

      <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        {requests.map((request) => (
          <ListItem
            key={request.id}
            button
            onClick={() => setSelectedRequest(request)}
            sx={{
              bgcolor: selectedRequest?.id === request.id 
                ? 'action.selected' 
                : 'inherit'
            }}
          >
            <ListItemText
              primary={`${request.method} ${request.url}`}
              secondary={
                `Status: ${request.response?.status} | 
                Latency: ${request.response?.latency}ms`
              }
            />
          </ListItem>
        ))}
      </List>

      {selectedRequest && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => onReuseRequest(selectedRequest)}
            sx={{ mb: 2 }}
          >
            Повторить
          </Button>
          <ResponseDisplay 
            data={selectedRequest.response.data}
            status={selectedRequest.response.status}
            headers={selectedRequest.response.headers}
            latency={selectedRequest.response.latency}
          />
        </Box>
      )}
    </Paper>
  );
};

RequestHistory.propTypes = {
  requests: PropTypes.array.isRequired,
  onReuseRequest: PropTypes.func.isRequired
};

export default RequestHistory;