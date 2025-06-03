import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person,
  Email,
  Edit,
  Save,
  Cancel,
  Lock
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector(state => state.auth);
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || ''
    });
    setEditing(false);
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 비밀번호 변경 API 호출 (추후 구현)
      alert('비밀번호가 변경되었습니다.');
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('비밀번호 변경 실패:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        👤 프로필 설정
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        내 프로필과 계정 설정을 관리하세요
      </Typography>

      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          프로필이 성공적으로 업데이트되었습니다!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 프로필 카드 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {getInitials(user.fullName || user.username)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.fullName || user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.userType === 'student' ? '학습자' : 
                 user.userType === 'instructor' ? '강사' : '관리자'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 기본 정보 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">기본 정보</Typography>
                {!editing ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    variant="outlined"
                  >
                    수정
                  </Button>
                ) : (
                  <Box display="flex" gap={1}>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      variant="contained"
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={20} /> : '저장'}
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancelEdit}
                      variant="outlined"
                    >
                      취소
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이름"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이메일"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="사용자명"
                    value={user.username}
                    disabled
                    helperText="사용자명은 변경할 수 없습니다"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="사용자 유형"
                    value={user.userType === 'student' ? '학습자' : 
                           user.userType === 'instructor' ? '강사' : '관리자'}
                    disabled
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* 보안 설정 */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                보안 설정
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1">비밀번호</Typography>
                  <Typography variant="body2" color="text.secondary">
                    계정 보안을 위해 정기적으로 비밀번호를 변경하세요
                  </Typography>
                </Box>
                <Button
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                  variant="outlined"
                >
                  비밀번호 변경
                </Button>
              </Box>

              {user.lastLogin && (
                <Box mt={3}>
                  <Typography variant="body2" color="text.secondary">
                    마지막 로그인: {new Date(user.lastLogin).toLocaleString('ko-KR')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>비밀번호 변경</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <TextField
              fullWidth
              label="현재 비밀번호"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              fullWidth
              label="새 비밀번호"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              helperText="최소 6자 이상 입력하세요"
            />
            <TextField
              fullWidth
              label="새 비밀번호 확인"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>취소</Button>
          <Button 
            onClick={handlePasswordSubmit} 
            variant="contained"
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            변경
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
