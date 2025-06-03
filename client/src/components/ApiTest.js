import React, { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import authService from '../services/authService';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('테스트 로그인 시작...');
      const credentials = {
        email: 'student@pbtlms.com',
        password: 'student123'
      };

      console.log('전송 데이터:', credentials);
      const response = await authService.login(credentials);
      console.log('응답 데이터:', response);
      
      setResult(JSON.stringify(response, null, 2));
    } catch (err) {
      console.error('로그인 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Health check 시작...');
      const response = await fetch('http://localhost:3000/api/health');
      const data = await response.json();
      console.log('Health check 응답:', data);
      
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Health check 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        API 연결 테스트
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testHealthCheck}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Health Check 테스트
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary"
          onClick={testLogin}
          disabled={loading}
        >
          로그인 테스트
        </Button>
      </Box>

      {loading && (
        <Typography>요청 중...</Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          오류: {error}
        </Alert>
      )}

      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">응답 결과:</Typography>
          <Box 
            component="pre" 
            sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto'
            }}
          >
            {result}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ApiTest;