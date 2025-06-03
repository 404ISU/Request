// src/components/Tests/TestsTab.jsx
import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import AssessmentRounded from '@mui/icons-material/AssessmentRounded';
import LoadTestForm from './Load/LoadTestForm';
import LoadTestsList from './Load/LoadTestsList';
import LoadTestResult from './Load/LoadTestResult';

export default function TestsTab({ collectionId }) {
  const [tab, setTab] = useState('load');
  const [selectedTestId, setSelectedTestId] = useState(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Нагрузочные тесты" value="load" icon={<AssessmentRounded />} />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {tab === 'load' && (
          <>
            <LoadTestForm
              collectionId={collectionId}
              onCreated={id => setSelectedTestId(id)}
            />
            <LoadTestsList
              collectionId={collectionId}
              onSelect={id => setSelectedTestId(id)}
            />
            <LoadTestResult testId={selectedTestId} />
          </>
        )}
      </Box>
    </Box>
  );
}
