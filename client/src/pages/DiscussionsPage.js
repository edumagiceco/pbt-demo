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
  DialogActions,
  TextField,
  IconButton,
  Avatar,
  Fab,
  Paper,
  Divider,
  Badge
} from '@mui/material';
import {
  Forum as ForumIcon,
  PushPin as PinIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const DiscussionsPage = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [problems, setProblems] = useState([]);
  
  // 새 토론 생성 관련 상태
  const [newDiscussion, setNewDiscussion] = useState({
    problemId: '',
    title: '',
    content: ''
  });
  
  // 댓글 관련 상태
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchDiscussions();
    fetchProblems();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/discussions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('토론 목록을 불러오는데 실패했습니다');
      }
      
      const data = await response.json();
      setDiscussions(data.data?.discussions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/problems', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data.data || []);
      }
    } catch (err) {
      console.error('문제 목록 불러오기 오류:', err);
    }
  };

  const fetchDiscussionDetail = async (discussionId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/discussions/${discussionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedDiscussion(data.data);
      }
    } catch (err) {
      console.error('토론 상세 불러오기 오류:', err);
    }
  };

  const handleCreateDiscussion = async () => {
    try {
      if (!newDiscussion.problemId || !newDiscussion.title || !newDiscussion.content) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      const response = await fetch('http://localhost:3000/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newDiscussion)
      });

      if (response.ok) {
        setOpenCreateDialog(false);
        setNewDiscussion({ problemId: '', title: '', content: '' });
        fetchDiscussions();
      } else {
        const errorData = await response.json();
        alert(errorData.message || '토론 생성에 실패했습니다');
      }
    } catch (err) {
      console.error('토론 생성 오류:', err);
      alert('토론 생성 중 오류가 발생했습니다');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedDiscussion) return;

    try {
      setSubmittingComment(true);
      const response = await fetch(`http://localhost:3000/api/discussions/${selectedDiscussion.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        fetchDiscussionDetail(selectedDiscussion.id);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '댓글 작성에 실패했습니다');
      }
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      alert('댓글 작성 중 오류가 발생했습니다');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDiscussionClick = async (discussion) => {
    await fetchDiscussionDetail(discussion.id);
    setOpenViewDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          토론
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          새 토론 작성
        </Button>
      </Box>
      
      {discussions.length === 0 ? (
        <Alert severity="info">
          등록된 토론이 없습니다. 첫 번째 토론을 시작해보세요!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {discussions.map((discussion) => (
            <Grid item xs={12} key={discussion.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleDiscussionClick(discussion)}
              >
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ForumIcon />
                    </Avatar>
                    
                    <Box flexGrow={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {discussion.isPinned && (
                          <PinIcon color="warning" fontSize="small" />
                        )}
                        <Typography variant="h6" component="h2">
                          {discussion.title}
                        </Typography>
                      </Box>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 2
                        }}
                      >
                        {discussion.content}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        {discussion.Problem && (
                          <Chip
                            label={discussion.Problem.title}
                            color="primary"
                            size="small"
                          />
                        )}
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <ViewIcon fontSize="small" color="disabled" />
                          <Typography variant="caption" color="text.secondary">
                            {discussion.viewCount}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CommentIcon fontSize="small" color="disabled" />
                          <Typography variant="caption" color="text.secondary">
                            {discussion.Comments?.length || 0}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          {discussion.User?.fullName || discussion.User?.username}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(discussion.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 새 토론 작성 다이얼로그 */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>새 토론 작성</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="문제 선택"
              value={newDiscussion.problemId}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, problemId: e.target.value }))}
              margin="normal"
              SelectProps={{
                native: true,
              }}
            >
              <option value="">문제를 선택하세요</option>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.title}
                </option>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="제목"
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="내용"
              multiline
              rows={6}
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>취소</Button>
          <Button onClick={handleCreateDiscussion} variant="contained">
            작성하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 토론 상세 보기 다이얼로그 */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
        maxHeight="90vh"
      >
        {selectedDiscussion && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" component="div">
                    {selectedDiscussion.title}
                  </Typography>
                  {selectedDiscussion.Problem && (
                    <Chip
                      label={selectedDiscussion.Problem.title}
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
                <IconButton onClick={() => setOpenViewDialog(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ maxHeight: '60vh' }}>
              <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="body1" paragraph>
                  {selectedDiscussion.content}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    작성자: {selectedDiscussion.User?.fullName || selectedDiscussion.User?.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(selectedDiscussion.createdAt)}
                  </Typography>
                </Box>
              </Paper>

              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                댓글 ({selectedDiscussion.Comments?.length || 0})
              </Typography>
              
              {selectedDiscussion.Comments && selectedDiscussion.Comments.length > 0 ? (
                selectedDiscussion.Comments.map((comment) => (
                  <Paper key={comment.id} elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" paragraph>
                      {comment.content}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {comment.User?.fullName || comment.User?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="댓글을 작성하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submittingComment}
              />
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                sx={{ ml: 1, minWidth: 'auto' }}
              >
                댓글
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default DiscussionsPage;
