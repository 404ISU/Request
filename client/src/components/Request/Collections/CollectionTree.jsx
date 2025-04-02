import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box 
} from '@mui/material';
import { Folder, Description, Delete, MoreVert, Edit } from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';
import axios from 'axios';

const CollectionTreeItem = ({ item, depth = 0, onUpdate, collectionId }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { id: item._id, parent: item.parent },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ITEM',
    drop: async (draggedItem) => {
      if (draggedItem.id !== item._id) {
        try {
          await axios.patch(`/api/collections/items/${draggedItem.id}`, {
            parent: item._id,
            collection: collectionId
          });
          onUpdate();
        } catch (error) {
          console.error('Error moving item:', error);
        }
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  }));

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleRename = async () => {
    const newName = prompt('New name:', item.name);
    if (newName) {
      try {
        await axios.patch(`/api/collections/items/${item._id}`, { name: newName });
        onUpdate();
      } catch (error) {
        console.error('Error renaming:', error);
      }
    }
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/collections/items/${item._id}`);
      onUpdate();
    } catch (error) {
      console.error('Error deleting:', error);
    }
    setAnchorEl(null);
  };

  return (
    <div 
      ref={drop}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? '#f5f5f5' : 'transparent'
      }}
    >
      <ListItem
        ref={drag}
        sx={{ 
          pl: depth * 4,
          cursor: 'move',
          '&:hover': { backgroundColor: '#fafafa' }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.type === 'folder' ? (
          <Folder sx={{ color: '#ffb74d', mr: 1 }} />
        ) : (
          <Description sx={{ color: '#64b5f6', mr: 1 }} />
        )}
        
        <ListItemText 
          primary={item.name} 
          secondary={item.type === 'request' ? item.request?.method : ''}
        />

        {isHovered && (
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        )}
      </ListItem>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleRename}>
          <Edit sx={{ mr: 1 }} /> Rename
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {item.children?.map(child => (
        <CollectionTreeItem
          key={child._id}
          item={child}
          depth={depth + 1}
          onUpdate={onUpdate}
          collectionId={collectionId}
        />
      ))}
    </div>
  );
};

export const CollectionTree = React.memo(({ collection, onUpdate }) => (
  <List dense sx={{ width: '100%' }}>
    {collection.rootItems?.map(item => (
      <CollectionTreeItem
        key={item._id}
        item={item}
        collectionId={collection._id}
        onUpdate={onUpdate}
      />
    ))}
  </List>
));