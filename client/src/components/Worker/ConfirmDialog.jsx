import React from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
} from '@mui/material';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="confirm-dialog-title" variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography id="confirm-dialog-description" variant="body1" sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            Подтвердить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmDialog;