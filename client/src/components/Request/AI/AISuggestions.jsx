import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Collapse, 
  IconButton, 
  TextField 
} from '@mui/material';
import { Lightbulb, Close } from '@mui/icons-material';

const AISuggestions = ({ apiUrl, method, onApply }) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const getSuggestions = async () => {
    // Реальная интеграция с AI API
    const mockSuggestions = [{
      url: apiUrl.replace('http://', 'https://'),
      method: method === 'GET' ? 'POST' : 'GET',
      reason: 'Повышение безопасности подключения'
    }];
    setSuggestions(mockSuggestions);
    setOpen(true);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button 
        startIcon={<Lightbulb />}
        onClick={getSuggestions}
        variant="outlined"
      >
        Получить рекомендации AI
      </Button>

      <Collapse in={open}>
        <Box sx={{ 
          mt: 1,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6">AI Рекомендации</Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {suggestions.map((suggestion, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Typography>{suggestion.reason}</Typography>
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => onApply(suggestion)}
              >
                Применить изменения
              </Button>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default AISuggestions;