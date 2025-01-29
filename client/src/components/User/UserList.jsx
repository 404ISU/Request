import React, { useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuthState } from "../../stores/authState";


const UserList = ({ users, onEdit, onDelete }) => {
    const { loading } = useAuthState();

    if (!users || users.length === 0) {
        return <p>No users yet</p>;
    }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow
                            key={user._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }} onClick={() => onEdit(user)}>
                            <TableCell component="th" scope="row">
                                {user.email}
                            </TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <Tooltip title="Edit">
                                    {!loading && <IconButton aria-label="edit" onClick={() => onEdit(user)}>
                                        <EditIcon />
                                    </IconButton>}
                                </Tooltip>
                                <Tooltip title="Delete">
                                    {!loading && <IconButton aria-label="delete" onClick={() => onDelete(user._id)}>
                                        <DeleteIcon />
                                    </IconButton>}
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserList;