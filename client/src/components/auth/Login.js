import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { School, Google, GitHub } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/authSlice';
import toast from '../../utils/toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'student@pbtlms.com',
    password: 'student123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      // 로그인 성공 알림
      toast.auth.loginSuccess(formData.email.split('@')[0]);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, formData.email]);

  useEffect(() => {
    // 에러 발생 시 알림
    if (error) {
      toast.error(error);
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('로그인 폼 제출:', formData);
    dispatch(login(formData));
  };

  const handleRegisterRedirect = () => {
    navigate('/register', { state: { from: location.state?.from } });
  };

  const testDirectLogin = async () => {
    try {
      console.log('직접 API 호출 테스트...');
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'student@pbtlms.com',
          password: 'student123'
        })
      });
      
      const data = await response.json();
      console.log('직접 API 응답:', data);
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('직접 API 호출 오류:', err);
      setTestResult(`오류: ${err.message}`);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <School sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              PBT LMS
            </Typography>
            <Typography component="h2" variant="h6" color="text.secondary" gutterBottom>
              로그인
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* 테스트 섹션 */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Button
                onClick={testDirectLogin}
                variant="outlined"
                color="info"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
              >
                🔧 API 연결 테스트 (개발용)
              </Button>
              {testResult && (
                <Box 
                  component="pre" 
                  sx={{ 
                    backgroundColor: '#f5f5f5', 
                    p: 1, 
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}
                >
                  {testResult}
                </Box>
              )}
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="이메일"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : '로그인'}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  disabled={isLoading}
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </Box>

              <Divider sx={{ my: 2 }}>또는</Divider>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                sx={{ mb: 1 }}
                disabled={isLoading}
              >
                Google로 로그인
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHub />}
                sx={{ mb: 2 }}
                disabled={isLoading}
              >
                GitHub로 로그인
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  계정이 없으신가요?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleRegisterRedirect}
                    disabled={isLoading}
                  >
                    회원가입
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;