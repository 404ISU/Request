import React, {useState} from 'react';
import {Select, MenuItem, TextField, FormControl, InputLabel, Box, Typography,Button, InputAdornment, IconButton } from '@mui/material';
import {InfoOutlined} from '@mui/icons-material'


const AuthInput = ({ onChange }) => {
  const [authConfig, setAuthConfig] = useState({
    type: 'none',
    credentials: { token: '', username: '', password: '' }
  });

  const handleTypeChange = (type) => {
    setAuthConfig(prev => ({ ...prev, type }));
    onChange({ type, ...authConfig.credentials });
  };

  return (
    <Box sx={{ 
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: 2
    }}>
      <Typography variant="subtitle2" gutterBottom>
        Метод аутентификации
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['none', 'bearer', 'basic'].map((type) => (
          <Button
            key={type}
            variant={authConfig.type === type ? 'contained' : 'outlined'}
            onClick={() => handleTypeChange(type)}
            sx={{ textTransform: 'none' }}
          >
            {{
              none: 'Нет аутентификации',
              bearer: 'Bearer Token',
              basic: 'Basic Auth'
            }[type]}
          </Button>
        ))}
      </Box>

      {authConfig.type === 'bearer' && (
        <TextField
          fullWidth
          label="Token"
          value={authConfig.credentials.token}
          onChange={(e) => {
            const newCreds = { ...authConfig.credentials, token: e.target.value };
            setAuthConfig(prev => ({ ...prev, credentials: newCreds }));
            onChange({ type: authConfig.type, ...newCreds });
          }}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small">
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      )}

      {authConfig.type === 'basic' && (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <TextField
            label="Username"
            size="small"
            value={authConfig.credentials.username}
            onChange={(e) => {
              const newCreds = { ...authConfig.credentials, username: e.target.value };
              setAuthConfig(prev => ({ ...prev, credentials: newCreds }));
              onChange({ type: authConfig.type, ...newCreds });
            }}
          />
          <TextField
            label="Password"
            type="password"
            size="small"
            value={authConfig.credentials.password}
            onChange={(e) => {
              const newCreds = { ...authConfig.credentials, password: e.target.value };
              setAuthConfig(prev => ({ ...prev, credentials: newCreds }));
              onChange({ type: authConfig.type, ...newCreds });
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AuthInput;