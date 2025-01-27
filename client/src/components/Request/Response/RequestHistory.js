import React, {useState} from 'react';
import {Paper, Typography, List, ListItem, ListItemText, Button, Box } from '@mui/material';


const RequestHistory = ({ requests }) => {
  const [page, setPage]=useState(1);
  const itemsPerPage=5;

  const paginatedRequests=requests.slice((page-1)*itemsPerPage, page * itemsPerPage);
  return (
    <Paper elevation={3} sx={{p:3, mb:3, backgroundColor: 'background.paper'}}>
      <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
      История запросов:
      </Typography>
      <List>
        {paginatedRequests.map((req, index)=>(
          <ListItem key={index}>
            <ListItemText primary={`${req.method} - ${req.url}`} secondary={req.timestamp}/>
          </ListItem>
        ))}
      </List>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mt:2}}>
        <Button onClick={()=>setPage(page-1)} disabled={page===1}>
        Назад
        </Button>
        <Button onClick={()=>setPage(page + 1)} disabled={page * itemsPerPage >= requests.length}>
          Вперед
        </Button>
      </Box>
    </Paper>

  );
};

export default RequestHistory;