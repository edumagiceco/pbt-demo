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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { School } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: 'student'
  });
  const [agreementChecked, setAgreementChecked] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 입력 검증
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (!agreementChecked) {
      alert('이용약관에 동의해주세요.');
      return;
    }

    // confirmPassword 제거 후 전송
    const { confirmPassword, ...submitData } = formData;
    dispatch(register(submitData));
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: location.state?.from } });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
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
              회원가입
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="이름"
                name="fullName"
                autoComplete="name"
                autoFocus
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="사용자명"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                helperText="영문, 숫자, _ 사용 가능 (3-20자)"
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="이메일"
                name="email"
                autoComplete="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="userType-label">사용자 유형</InputLabel>
                <Select
                  labelId="userType-label"
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  label="사용자 유형"
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <MenuItem value="student">학생</MenuItem>
                  <MenuItem value="instructor">강사</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="비밀번호"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                helperText="최소 6자 이상"
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="비밀번호 확인"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="이용약관 및 개인정보처리방침에 동의합니다"
                sx={{ mt: 2 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : '회원가입'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  이미 계정이 있으신가요?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleLoginRedirect}
                    disabled={isLoading}
                  >
                    로그인
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

export default Register;