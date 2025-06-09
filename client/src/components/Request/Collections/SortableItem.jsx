import React from 'react';
import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  MoreVert,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

export function SortableItem({
  id,
  data,
  onSelect,
  onMenuClick,
  isFolder,
  isExpanded,
  onExpandClick,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 0.5,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box {...listeners} {...attributes} sx={{ mr: 1, cursor: 'grab' }}>⋮</Box>
      {isFolder ? (
        <IconButton size="small" onClick={onExpandClick}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      ) : (
        <Box sx={{ width: 32 }} />
      )}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={onSelect}
      >
        {isFolder ? (
          <FolderIcon sx={{ mr: 1 }} color="primary" />
        ) : (
          <FileIcon sx={{ mr: 1 }} color="action" />
        )}
        <Typography noWrap variant="body2">
          {data.name}
        </Typography>
      </Box>
      <IconButton size="small" onClick={onMenuClick}>
        <MoreVert fontSize="small" />
      </IconButton>
    </Box>
  );
}

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['folder', 'request']).isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  onMenuClick: PropTypes.func.isRequired,
  isFolder: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpandClick: PropTypes.func.isRequired,
}; 