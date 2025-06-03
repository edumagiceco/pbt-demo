import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';

// Components
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import SolutionsPage from './pages/SolutionsPage';
import SolutionDetailPage from './pages/SolutionDetailPage';
import MaterialsPage from './pages/MaterialsPage';
import DiscussionsPage from './pages/DiscussionsPage';
import ProfilePage from './pages/ProfilePage';

// Actions
import { loadUser } from './store/authSlice';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  
  if (isLoading) {
    return <div>Loading...</div>; // TODO: Add proper loading component
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// App Content Component
const AppContent = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="problems" element={<ProblemsPage />} />
          <Route path="problems/:id" element={<ProblemDetailPage />} />
          <Route path="solutions" element={<SolutionsPage />} />
          <Route path="solutions/:id" element={<SolutionDetailPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="discussions" element={<DiscussionsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          {/* TODO: Add more routes */}
        </Route>
      </Routes>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // 기본 설정
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            },
            // 성공 알림 스타일
            success: {
              duration: 4000,
              style: {
                background: '#4caf50',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#4caf50',
              },
            },
            // 에러 알림 스타일
            error: {
              duration: 6000,
              style: {
                background: '#f44336',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#f44336',
              },
            },
            // 로딩 알림 스타일
            loading: {
              style: {
                background: '#6c757d',
              },
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
