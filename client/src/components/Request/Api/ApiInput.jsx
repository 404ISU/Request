import React from 'react';
import { Autocomplete, TextField, Box, Paper, Chip } from '@mui/material';
import PropTypes from 'prop-types';

const ApiInput = ({ 
  value, 
  onChange, 
  onBlur, 
  suggestions = [] // Значение по умолчанию
}) => {
  const [inputValue, setInputValue] = React.useState(value);
  const [showEnvSuggestions, setShowEnvSuggestions] = React.useState(false);

  // Динамические переменные
  const envVariables = [
    { key: '{{base_url}}', description: 'Base URL from environment' },
    { key: '{{timestamp}}', description: 'Current timestamp' },
    { key: '{{uuid}}', description: 'Random UUID' }
  ];

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);
  

  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      <Autocomplete
        freeSolo
        options={suggestions.filter(Boolean)} // Фильтр null/undefined
        inputValue={inputValue}
        onInputChange={(_, newValue) => {
          setInputValue(newValue);
          onChange(newValue);
          setShowEnvSuggestions(newValue?.includes('{{') || false);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="API URL"
            onBlur={onBlur}
            placeholder="https://api.example.com/endpoint"
            error={
              // Показывать ошибку только если поле не пустое И не валидно
              inputValue.trim() !== '' && 
              !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(inputValue)
            }
            helperText={
              inputValue.trim() !== '' && 
              !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(inputValue) && 
              "Invalid URL format"
            }
          />
        )}
      />

      {showEnvSuggestions && (
        <Paper sx={{
          position: 'absolute',
          width: '100%',
          zIndex: 2,
          mt: 1,
          p: 1,
          bgcolor: 'background.paper'
        }}>
          {envVariables.map((env) => (
            <Chip
              key={env.key}
              label={`${env.key} - ${env.description}`}
              onClick={() => {
                const newValue = inputValue.replace('{{', `${env.key}`);
                setInputValue(newValue);
                onChange(newValue);
                setShowEnvSuggestions(false);
              }}
              sx={{ m: 0.5, cursor: 'pointer' }}
              variant="outlined"
            />
          ))}
        </Paper>
      )}
    </Box>
  );
};

ApiInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  suggestions: PropTypes.arrayOf(PropTypes.string)
};

ApiInput.defaultProps = {
  suggestions: [],
  onBlur: () => {}
};

export default ApiInput;