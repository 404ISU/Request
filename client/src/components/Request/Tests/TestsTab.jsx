// src/components/Tests/TestsTab.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import BugReportRounded from '@mui/icons-material/BugReportRounded';

export default function TestsTab({ collectionId }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <BugReportRounded sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Функциональное тестирование
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        В разработке...
      </Typography>
    </Box>
  );
}
