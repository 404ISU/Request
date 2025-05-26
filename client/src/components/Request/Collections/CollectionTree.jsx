import React, { useState, useEffect } from 'react';
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
import { arrayMove } from '@dnd-kit/sortable';
import axios from 'axios';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { FixedSizeList as ReactWindowList } from 'react-window';
import PropTypes from 'prop-types';

const CollectionTreeItem = ({ item, index, depth = 0, collectionId, onDelete, setNewItemDialogOpen }) => {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(item.isExpanded);
  const [menuOpen, setMenuOpen] = useState(null);
  const [newItemParent, setNewItemParent]=useState(null);


  useEffect(() => {
  setIsExpanded(item.isExpanded ?? true);
}, [item.isExpanded]);

const handleToggle = async () => {
  try {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    await axios.patch(`/api/collections/items/${item._id}/toggle`, {
      isExpanded: newState
    });
    
    queryClient.setQueryData(['collections'], prev => 
      prev.map(coll => ({
        ...coll,
        items: coll.items.map(i => 
          i._id === item._id ? {...i, isExpanded: newState} : i
        )
      }))
    );
  } catch (error) {
    console.error('Toggle error:', error);
    setIsExpanded(!newState); // Откатываем состояние при ошибке
  }
};

  const handleRename = async() => {
    const newName = prompt('Введите новое название', item.name);
    if(newName){
      await axios.patch(`/api/collections/items/${item._id}/rename`, {name: newName});
      queryClient.invalidateQueries(['collections'])
    }
    setMenuOpen(null)
  };

const handleDelete = async ()=>{
  try {
    await onDelete(item._id); 
    queryClient.invalidateQueries({queryKey: ['collections']})
  } catch (error) {
    console.error('Ошибка уладения коллекции')
  }
}

const handleCreateItem = async () => {
  try {
    const { data } = await axios.post(
      `/api/collections/${collectionId}/items`,
      {
        name: 'New Item',
        type: 'request',
        parentId: newItemParent // Используем сохраненный parentId
      }
    );
    
    queryClient.setQueryData(['collections'], prev => 
      prev.map(coll => 
        coll._id === collectionId 
          ? { ...coll, items: [...coll.items, data] } 
          : coll
      )
    );
  } catch (error) {
    console.error('Error creating item:', error);
  }
};

  return (
    <Draggable 
      key={item._id}
      draggableId={String(item._id)} 
      index={index}
    >
      {(provided, snapshot) => (
        <div
      {...provided.draggableProps}
      ref={provided.innerRef}
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
              secondary={item.type === 'request' ? `${item.request?.method || 'GET'} ${item.request?.url || ''}` : 'Папка'}
            />

            {item.type === 'folder' &&(
              <IconButton onClick={()=>{setNewItemDialogOpen(true); setNewItemParent(item._id)}}>
              <Add fontSize="small"/>
              </IconButton>
            )}

            <IconButton onClick={(e) => setMenuOpen(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </ListItem>

          <Menu
            anchorEl={menuOpen}
            open={Boolean(menuOpen)}
            onClose={() => setMenuOpen(null)}
            disabledPortal
            disabledScrollLock
            MenuListProps={{'aria-labelledby': 'basic-button',}}
            componentsProps={{backdrop: {
              sx: {
                backgroundColor: 'transparent'
              }
            }}}>
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
                  {isExpanded && item.children?.map((child, index) => (
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
const [items, setItems]=useState([]);
const [localItems, setLocalItems]=useState(collection?.items || []);
const [forceUpdate, setForceUpdate] = useState(false);
const queryClient = useQueryClient();



  if(!collection){
    return <Typography>Коллекция не загружена</Typography>;
    return null;
  }

  if(!collection?.items) return <Typography>Коллекция пуста</Typography>

const { mutate: deleteItem } = useMutation({
  mutationFn: (itemId) => axios.delete(`/api/collections/items/${itemId}`),
  onSuccess: (_, itemId) => {
    queryClient.setQueryData(['collections'], prev => 
      prev.map(coll => ({
        ...coll,
        items: coll.items.filter(item => item._id !== itemId)
      }))
    );
  }
});

const { mutate: renameItem } = useMutation({
  mutationFn: ({ itemId, name }) => 
    axios.patch(`/api/collections/items/${itemId}/rename`, { name }),
  onSuccess: (data) => {
    queryClient.setQueryData(['collections'], prev => 
      prev.map(coll => ({
        ...coll,
        items: coll.items.map(item => 
          item._id === data._id ? data : item
        )
      }))
    );
  }
});


  // автоматическое обновление
  const {data: updatedCollection}=useQuery({
    queryKey: ['collection', collection._id],
    queryFn: async()=>{
      const {data} = await axios.get(`/api/collections/${collection._id}`);
      return data;
    },
    initialDataUpdatedAtL: ()=>Date.now(),
  })

  useEffect(() => {
    const loadItems = async () => {
      try {
        const { data } = await axios.get(`/api/collections/${collection._id}/items`);
        setLocalItems(data);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };
    
    if (collection?._id) {
      loadItems();
    }
  }, [collection]);


const handleDragEnd = async (result) => {
  const { source, destination } = result;

  if (!destination || 
    (source.droppableId === destination.droppableId &&
     source.index === destination.index)
  ) {
    return;
  }

  try {
    const newItems = [...localItems];
    const [movedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, movedItem);

    // Оптимистичное обновление
    setLocalItems(newItems);

    // Подготовка данных для запроса
    const updateData = {
      items: newItems.map((item, index) => ({
        id: item._id,
        order: index,
        parentId: destination.droppableId === collection._id ? null : destination.droppableId
      }))
    };

    const response = await axios.patch(
      `/api/collections/${collection._id}/reorder`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Синхронизация с актуальными данными сервера
    queryClient.setQueryData(['collections'], prev => 
      prev.map(coll => 
        coll._id === collection._id 
          ? { ...coll, items: response.data.items } 
          : coll
      )
    );

  } catch (error) {
    // Откат изменений при ошибке
    setLocalItems([...localItems]);
    console.error('Reorder failed:', error);
    alert(`Ошибка: ${error.response?.data?.message || error.message}`);
  }
};
  return (
    <Box sx={{position: 'relative'}}>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Typography>{collection?.name || 'Без названия'}</Typography>
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
    depth={0}
    collectionId={collection._id}
    onDelete={deleteItem}
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


CollectionTree.PropTypes={
  collection: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    items: PropTypes.array,
  }),
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
}