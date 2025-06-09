import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { ExpandMore, Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const EnvironmentVariables = ({ collectionId }) => {
  const [newVar, setNewVar] = useState({ key: '', value: '' });
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: variables, isLoading, error: queryError } = useQuery({
    queryKey: ['variables', collectionId],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/api/collections/${collectionId}/variables`);
        return data;
      } catch (err) {
        setError('Ошибка загрузки переменных окружения');
        throw err;
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (updatedVars) => {
      try {
        await axios.put(`/api/collections/${collectionId}/variables`, updatedVars);
      } catch (err) {
        setError('Ошибка сохранения переменных окружения');
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['variables', collectionId]);
    }
  });

  const validateVariable = (key, value) => {
    if (!key.trim()) {
      setError('Ключ не может быть пустым');
      return false;
    }
    if (key.includes(' ')) {
      setError('Ключ не может содержать пробелы');
      return false;
    }
    if (key.includes('{{') || key.includes('}}')) {
      setError('Ключ не может содержать {{ или }}');
      return false;
    }
    return true;
  };

  const handleAddVariable = () => {
    if (!validateVariable(newVar.key, newVar.value)) return;
    
    if (newVar.key && newVar.value) {
      mutation.mutate({ ...variables, [newVar.key]: newVar.value });
      setNewVar({ key: '', value: '' });
    }
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setEditValue(variables[key]);
  };

  const handleSaveEdit = () => {
    if (!validateVariable(editingKey, editValue)) return;
    
    const updatedVars = { ...variables };
    updatedVars[editingKey] = editValue;
    mutation.mutate(updatedVars);
    setEditingKey(null);
  };

  const handleDelete = (key) => {
    const updatedVars = { ...variables };
    delete updatedVars[key];
    mutation.mutate(updatedVars);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddVariable();
    }
  };

  return (
    <>
      <Accordion defaultExpanded sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Переменные окружения</Typography>
          <Chip 
            label={`${Object.keys(variables || {}).length} переменных`} 
            size="small" 
            sx={{ ml: 2 }}
          />
        </AccordionSummary>
        
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Ключ"
              value={newVar.key}
              onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
              onKeyPress={handleKeyPress}
              fullWidth
              placeholder="Например: base_url"
              helperText="Используйте в URL как {{key}}"
            />
            <TextField
              label="Значение"
              value={newVar.value}
              onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
              onKeyPress={handleKeyPress}
              fullWidth
              placeholder="Например: https://api.example.com"
            />
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddVariable}
              disabled={!newVar.key || !newVar.value}
            >
              Добавить
            </Button>
          </Box>

          {Object.entries(variables || {}).map(([key, value]) => (
            <Box key={key} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
              <TextField
                value={key}
                disabled
                sx={{ flex: 1 }}
                label="Ключ"
              />
              <TextField
                value={editingKey === key ? editValue : value}
                onChange={(e) => editingKey === key && setEditValue(e.target.value)}
                disabled={editingKey !== key}
                sx={{ flex: 1 }}
                label="Значение"
              />
              {editingKey === key ? (
                <>
                  <IconButton onClick={handleSaveEdit} color="primary">
                    <Save />
                  </IconButton>
                  <IconButton onClick={() => setEditingKey(null)} color="error">
                    <Cancel />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton onClick={() => handleEdit(key)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(key)} color="error">
                    <Delete />
                  </IconButton>
                </>
              )}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EnvironmentVariables;