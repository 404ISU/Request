import React, { memo, useMemo, useState } from 'react';
import { 
  Paper,
  Typography,
  IconButton,
  Box,
  Stack,
  Collapse,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import Editor from '@monaco-editor/react';

const ResponseDisplay = memo(({ 
  data, 
  status, 
  headers, 
  latency, 
  timestamp, 
  error 
}) => {
  const [expanded, setExpanded] = useState(true);
  const [viewMode, setViewMode] = useState('json');

  const formattedResponse = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return '{}';
    return JSON.stringify(data, null, 2);
  }, [data]);
  return (
    <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
      <Stack spacing={1}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {error ? 'Ошибка' : `Ответ ${status} (${latency} мс)`}
          </Typography>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <Tabs 
                value={viewMode} 
                onChange={(_, newValue) => setViewMode(newValue)}
                sx={{ mb: 1 }}
              >
                <Tab label="JSON" value="json" />
                <Tab label="Заголовки" value="headers" />
              </Tabs>

              {viewMode === 'json' ? (
                <Editor
                  height="300px"
                  language="json"
                  value={formattedResponse}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    lineNumbers: 'off'
                  }}
                />
              ) : (
                <Box sx={{ mt: 2 }}>
                  {Object.entries(headers || {}).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {key}:
                      </Typography>
                      <Typography variant="body2">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </Collapse>
      </Stack>
    </Paper>
  );
});

export default ResponseDisplay;