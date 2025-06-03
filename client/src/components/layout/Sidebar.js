import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Code,
  School,
  Group,
  BarChart,
  Settings,
  Help
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = ({ open, onClose, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: '대시보드', icon: <Dashboard />, path: '/dashboard', roles: ['student', 'instructor', 'admin'] },
    { text: '문제 목록', icon: <Assignment />, path: '/problems', roles: ['student', 'instructor', 'admin'] },
    { text: '내 솔루션', icon: <Code />, path: '/solutions', roles: ['student'] },
    { text: '학습 자료', icon: <School />, path: '/materials', roles: ['student', 'instructor', 'admin'] },
    { text: '토론', icon: <Group />, path: '/discussions', roles: ['student', 'instructor', 'admin'] },
  ];

  const instructorItems = [
    { text: '문제 관리', icon: <Assignment />, path: '/instructor/problems', roles: ['instructor', 'admin'] },
    { text: '학습자 관리', icon: <Group />, path: '/instructor/students', roles: ['instructor', 'admin'] },
    { text: '성적 관리', icon: <BarChart />, path: '/instructor/grades', roles: ['instructor', 'admin'] },
  ];

  const adminItems = [
    { text: '사용자 관리', icon: <Group />, path: '/admin/users', roles: ['admin'] },
    { text: '시스템 설정', icon: <Settings />, path: '/admin/settings', roles: ['admin'] },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const renderMenuItems = (items, title) => {
    const filteredItems = items.filter(item => 
      user && item.roles.includes(user.userType)
    );

    if (filteredItems.length === 0) return null;

    return (
      <>
        {title && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {title}
            </Typography>
          </Box>
        )}
        <List>
          {filteredItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        {/* Logo Section */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="primary">
            🧩 PBT LMS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Problem-Based Training
          </Typography>
        </Box>
        
        <Divider />
        
        {/* Main Menu */}
        {renderMenuItems(menuItems)}
        
        {/* Instructor Menu */}
        {user && (user.userType === 'instructor' || user.userType === 'admin') && (
          <>
            <Divider />
            {renderMenuItems(instructorItems, '강사 메뉴')}
          </>
        )}
        
        {/* Admin Menu */}
        {user && user.userType === 'admin' && (
          <>
            <Divider />
            {renderMenuItems(adminItems, '관리자 메뉴')}
          </>
        )}
        
        <Divider />
        
        {/* Help Menu */}
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/help')}>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText primary="도움말" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;