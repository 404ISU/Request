import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore, Add } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';

const EnvironmentVariables = ({ collectionId }) => {
  const [newVar, setNewVar] = useState({ key: '', value: '' });
  
  const { data: variables } = useQuery({
    queryKey: ['variables', collectionId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/collections/${collectionId}/variables`);
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: (updatedVars) => 
      axios.put(`/api/collections/${collectionId}/variables`, updatedVars)
  });

  const handleAddVariable = () => {
    if (newVar.key && newVar.value) {
      mutation.mutate({ ...variables, [newVar.key]: newVar.value });
      setNewVar({ key: '', value: '' });
    }
  };

  return (
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
            fullWidth
          />
          <TextField
            label="Значение"
            value={newVar.value}
            onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
            fullWidth
          />
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddVariable}
          >
            Добавить
          </Button>
        </Box>

        {Object.entries(variables || {}).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <TextField
              value={key}
              disabled
              sx={{ flex: 1 }}
            />
            <TextField
              value={value}
              disabled
              sx={{ flex: 1 }}
            />
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default EnvironmentVariables;