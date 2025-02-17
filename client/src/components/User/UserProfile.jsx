import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Box,
    Typography,
    TextField,
    Button,
    Container,
    Grid,
    Paper,
    Modal,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        firstName: '',
        lastName: '',
        organizationName: '',
        organizationAddress: '',
        organizationPhone: '',
    });
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Загрузка профиля пользователя
    const fetchProfile = async () => {
        try {
            const response = await axios.get('/profile', { withCredentials: true });
            setUser(response.data);

            // Инициализация состояния обновления данных из профиля
            setUpdatedUser({
                username: response.data.username,
                email: response.data.email,
                name: response.data.name || '',
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                organizationName: response.data.organizationName || '',
                organizationAddress: response.data.organizationAddress || '',
                organizationPhone: response.data.organizationPhone || '',
            });
        } catch (error) {
            toast.error('Ошибка при загрузке профиля');
            console.error("Error fetching profile:", error); // Log the error for debugging
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleOpenModal = () => {
        setUpdatedUser({
            username: user.username,
            email: user.email,
            name: user.name || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            organizationName: user.organizationName || '',
            organizationAddress: user.organizationAddress || '',
            organizationPhone: user.organizationPhone || '',
        }); // Reset updatedUser to current user data when opening modal
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleOpenConfirmation = () => {
        setConfirmOpen(true);
    };

    const handleCloseConfirmation = () => {
        setConfirmOpen(false);
    };

    // Обновление профиля
    const handleUpdateProfile = () => {
        handleOpenConfirmation(); // Open confirmation dialog
    };

    const handleConfirmUpdate = async () => {
        try {
            await axios.put('/update-profile', updatedUser, { withCredentials: true });
            toast.success('Профиль успешно обновлен');
            fetchProfile(); // Обновление данных после изменений
            handleCloseModal();
        } catch (error) {
            toast.error('Ошибка при обновлении профиля');
            console.error("Error updating profile:", error); // Log the error for debugging
        } finally {
            handleCloseConfirmation();
        }
    };

    if (!user) return <div>Загрузка...</div>;

    return (
        <Container maxWidth="md">
            <Paper elevation={3}>
                <Typography variant="h2" align="center">
                    Личный кабинет
                </Typography>

                <Typography variant="h3">Текущие данные:</Typography>
                <Box mb={3}>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <AccountCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary={`Логин: ${user.username}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <EmailIcon />
                            </ListItemIcon>
                            <ListItemText primary={`Email: ${user.email}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <LockIcon />
                            </ListItemIcon>
                            <ListItemText primary={`Имя: ${user.name}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <AccountCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary={`Фамилия: ${user.firstName}`} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <AccountCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary={`Отчество: ${user.lastName}`} />
                        </ListItem>

                        {user.role === 'organization' && (
                            <>
                                <ListItem>
                                    <ListItemIcon>
                                        <BusinessIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={`Название организации: ${user.organizationName}`} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <LocationOnIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={`Адрес организации: ${user.organizationAddress}`} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <PhoneIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={`Телефон организации: ${user.organizationPhone}`} />
                                </ListItem>
                            </>
                        )}
                    </List>
                </Box>

                <Button variant="contained" color="primary" onClick={handleOpenModal}>
                    Редактировать профиль
                </Button>

                {/* Modal for Editing Profile */}
                <Modal
                    open={openModal}
                    onClose={handleCloseModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 4,
                        }}
                    >
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Редактирование профиля
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Логин"
                                    variant="outlined"
                                    name="username"
                                    value={updatedUser.username}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    variant="outlined"
                                    type="email"
                                    name="email"
                                    value={updatedUser.email}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Новый пароль (оставьте пустым, если не меняете)"
                                    variant="outlined"
                                    type="password"
                                    name="password"
                                    value={updatedUser.password}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Имя"
                                    variant="outlined"
                                    name="name"
                                    value={updatedUser.name}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Фамилия"
                                    variant="outlined"
                                    name="firstName"
                                    value={updatedUser.firstName}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Отчество"
                                    variant="outlined"
                                    name="lastName"
                                    value={updatedUser.lastName}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {user.role === 'organization' && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Название организации"
                                            variant="outlined"
                                            name="organizationName"
                                            value={updatedUser.organizationName}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Адрес организации"
                                            variant="outlined"
                                            name="organizationAddress"
                                            value={updatedUser.organizationAddress}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Телефон организации"
                                            variant="outlined"
                                            name="organizationPhone"
                                            value={updatedUser.organizationPhone}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                        <Box mt={2} display="flex" justifyContent="space-between">
                            <Button variant="contained" color="primary" onClick={handleUpdateProfile}>
                                Сохранить
                            </Button>
                            <Button variant="outlined" onClick={handleCloseModal}>
                                Отмена
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* Confirmation Dialog */}
                <Dialog
                    open={confirmOpen}
                    onClose={handleCloseConfirmation}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Подтверждение изменений</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Вы уверены, что хотите сохранить изменения профиля?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmation}>Отмена</Button>
                        <Button onClick={handleConfirmUpdate} autoFocus>
                            Подтвердить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}