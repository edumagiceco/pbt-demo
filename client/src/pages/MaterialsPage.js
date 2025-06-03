import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Description as DocumentIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/problems', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('문제 목록을 불러오는데 실패했습니다');
      }
      
      const data = await response.json();
      setProblems(data.data || []);
      
      // 각 문제의 학습 자료 가져오기
      if (data.data && data.data.length > 0) {
        fetchAllMaterials(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMaterials = async (problemList) => {
    try {
      const allMaterials = [];
      
      for (const problem of problemList) {
        const response = await fetch(`http://localhost:3000/api/materials/problem/${problem.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const materialsWithProblem = data.data.map(material => ({
            ...material,
            problemTitle: problem.title
          }));
          allMaterials.push(...materialsWithProblem);
        }
      }
      
      setMaterials(allMaterials);
    } catch (err) {
      console.error('학습 자료 불러오기 오류:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayIcon />;
      case 'document':
        return <DocumentIcon />;
      case 'link':
        return <LinkIcon />;
      case 'code':
        return <CodeIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'error';
      case 'document':
        return 'primary';
      case 'link':
        return 'secondary';
      case 'code':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleMaterialClick = (material) => {
    if (material.type === 'link' && material.url) {
      window.open(material.url, '_blank');
    } else if (material.filePath) {
      setSelectedMaterial(material);
      setOpenDialog(true);
    }
  };

  const handleDownload = (material) => {
    if (material.filePath) {
      const link = document.createElement('a');
      link.href = material.filePath;
      link.download = material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        학습 자료
      </Typography>
      
      {materials.length === 0 ? (
        <Alert severity="info">
          등록된 학습 자료가 없습니다.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleMaterialClick(material)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {getTypeIcon(material.type)}
                    <Chip
                      label={material.type}
                      color={getTypeColor(material.type)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {material.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    문제: {material.problemTitle}
                  </Typography>
                  
                  {material.uploader && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      등록자: {material.uploader.fullName || material.uploader.username}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.secondary">
                    등록일: {new Date(material.createdAt).toLocaleDateString('ko-KR')}
                  </Typography>
                  
                  {material.filePath && (
                    <Box mt={2}>
                      <Button
                        startIcon={<DownloadIcon />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(material);
                        }}
                      >
                        다운로드
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 자료 상세 보기 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedMaterial?.title}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMaterial && (
            <Box>
              <Typography variant="body1" gutterBottom>
                문제: {selectedMaterial.problemTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                유형: {selectedMaterial.type}
              </Typography>
              {selectedMaterial.uploader && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  등록자: {selectedMaterial.uploader.fullName || selectedMaterial.uploader.username}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                등록일: {new Date(selectedMaterial.createdAt).toLocaleDateString('ko-KR')}
              </Typography>
              
              {selectedMaterial.filePath && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(selectedMaterial)}
                  >
                    파일 다운로드
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default MaterialsPage;
