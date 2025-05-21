import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Button 
} from '@mui/material';
import { Folder, InsertDriveFile, Delete, MoreVert, Edit, ExpandMore, ExpandLess, Add } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { FixedSizeList as ReactWindowList } from 'react-window';

const CollectionTreeItem = ({ item, index, depth = 0, collectionId, onDelete, setNewItemDialogOpen }) => {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(item.isExpanded);

  const handleToggle = async () => {
    try {
      await axios.patch(`/api/collections/items/${item._id}/toggle`, {
        isExpanded: !isExpanded
      });
      setIsExpanded(!isExpanded);
    } catch (error) {
      console.error('Error toggling folder:', error);
    }
  };

  const handleRename = () => {
    setAnchorEl(null);
    // Логика переименования
  };

const handleDelete = async ()=>{
  try {
    await onDelete(item._id); 
    queryClient.invalidateQueries({queryKey: ['collections']})
  } catch (error) {
    console.error('Ошибка уладения коллекции')
  }
}

  return (
    <Draggable 
      draggableId={item._id.toString()} 
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            paddingLeft: depth * 32,
          }}
        >
          <ListItem
            {...provided.dragHandleProps}
            sx={{
              bgcolor: 'background.paper',
              mb: 0.5,
              borderRadius: 2,
              border: '1px solid #eee',
            }}
          >
            {item.type === 'folder' && (
              <IconButton onClick={handleToggle} size="small">
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            
            {item.type === 'folder' ? (
              <Folder sx={{ color: '#ffb74d', mx: 1 }} />
            ) : (
              <InsertDriveFile sx={{ color: '#64b5f6', mx: 1 }} />
            )}

            <ListItemText
              primary={item.name}
              secondary={item.type === 'request' ? `${item.request?.method} ${item.request?.url}` : 'Папка'}
            />

            {item.type === 'folder' &&(
              <IconButton onClick={(e)=>{e.stopPropagation(); setNewItemDialogOpen(true)}}>
              <Add fontSize="small"/>
              </IconButton>
            )}

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </ListItem>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleRename}>
              <Edit sx={{ mr: 1 }} /> Переименовать
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <Delete sx={{ mr: 1 }} /> Удалить
            </MenuItem>
          </Menu>

          {item.type === 'folder' && isExpanded && (
            <Droppable 
              droppableId={item._id.toString()} 
              type="ITEM"
              direction="vertical"
            >
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  style={{ paddingLeft: 16 }}
                >
                  {item.children?.map((child, index) => (
                    <CollectionTreeItem
                      key={child._id}
                      item={child}
                      index={index}
                      depth={depth + 1}
                      collectionId={collectionId}
                      onDelete={onDelete}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
};

export const CollectionTree = ({ collection, onDelete, onSelect }) => {
const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  if(!collection?.items) return <Typography>Коллекция пуста</Typography>

  const queryClient = useQueryClient();

  // автоматическое обновление
  const {data: updatedCollection}=useQuery({
    queryKey: ['collection', collection._id],
    queryFn: async()=>{
      const {data} = await axios.get(`/api/collections/${collection._id}`);
      return data;
    },
    initialData: collection // Используем начальные значение 
  })

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    try {
      await axios.patch(`/api/collections/${collection._id}/reorder`, {
        itemId: result.draggableId,
        newIndex: result.destination.index,
        newParentId: result.destination.droppableId
      });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  };

  return (
    <Box sx={{position: 'relative'}}>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Typography>{updatedCollection.name}</Typography>
        <IconButton onClick={()=>setNewItemDialogOpen(true)} size="small" sx={{ml: 'auto'}}>
          <Add/>
        </IconButton>
      </Box>

    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={collection._id}>
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef} sx={{flex: 1}}>
            {collection.items?.map((item, index) => (
              <CollectionTreeItem
                key={item._id}
                item={item}
                index={index}
                collectionId={collection._id}
                onDelete={onDelete}
                setNewItemDialogOpen={setNewItemDialogOpen}
              />
            ))}
            {provided.placeholder}
            <Button variant="outlined" startIcon={<Add/>} onClick={()=>setNewItemDialogOpen(true)} sx={{mt:1, mx:2}}>Новый элемент</Button>
          </Box>
        )}
      </Droppable>
    </DragDropContext>
      </Box>
  );
};
