import React from 'react';
import { 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  useTheme 
} from '@mui/material';

const MethodSelector = ({ value, onChange }) => {
  const theme = useTheme(); 
  const methods = [
    { value: 'GET', color: 'success' },
    { value: 'POST', color: 'primary' },
    { value: 'PUT', color: 'warning' },
    { value: 'DELETE', color: 'error' },
    { value: 'PATCH', color: 'info' },
    { value: 'HEAD', color: 'secondary' }
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0.5,
      p: 1,
      borderRadius: 1,
      bgcolor: 'background.paper'
    }}>
      {methods.map((method) => (
        <Button
          key={method.value}
          onClick={() => onChange(method.value)}
          variant={value === method.value ? 'contained' : 'outlined'}
          color={method.color}
          size="small"
          sx={{ 
            textTransform: 'none',
            minWidth: 70,
            '&.MuiButton-contained': {
              boxShadow: theme.shadows[1]
            }
          }}
        >
          {method.value}
        </Button>
      ))}
    </Box>
  );
};

export default MethodSelector;