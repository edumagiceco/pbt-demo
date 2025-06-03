import React, { useState } from 'react';
import { Box, Container, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        user={isAuthenticated ? user : null}
        onLogout={handleLogout}
        onToggleDrawer={handleToggleDrawer}
      />
      
      <Sidebar 
        open={drawerOpen}
        onClose={handleCloseDrawer}
        user={isAuthenticated ? user : null}
      />
      
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;