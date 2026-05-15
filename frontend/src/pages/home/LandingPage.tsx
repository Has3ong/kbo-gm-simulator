import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import DeleteIcon from '@mui/icons-material/Delete'
import { useLandingPage } from './LandingPageHooks'
import { teamLogoSrc } from '../../constants'

export default function LandingPage() {
  const { savedGames, loadDialogOpen, setLoadDialogOpen, handleNewGame, handleOpenLoad, handleLoad, handleDelete, hasSaves } =
    useLandingPage()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a1628',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 그라데이션 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(43,108,176,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <SportsBaseballIcon sx={{ fontSize: 72, color: '#63b3ed', mb: 3, opacity: 0.9 }} />

      <Typography
        variant="h3"
        sx={{ color: 'white', mb: 1, textAlign: 'center', letterSpacing: '-0.5px', fontWeight: 'bold' }}
      >
        KBO 단장 시뮬레이터
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ color: 'rgba(255,255,255,0.5)', mb: 8, textAlign: 'center' }}
      >
        당신의 구단을 이끌어 한국시리즈 우승을 차지하세요
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 280 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={handleNewGame}
          sx={{
            py: 1.8,
            fontSize: '1.05rem',
            fontWeight: 'bold',
            bgcolor: '#2b6cb0',
            '&:hover': { bgcolor: '#2c5282' },
          }}
        >
          새 게임 시작
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<FolderOpenIcon />}
          disabled={!hasSaves}
          onClick={handleOpenLoad}
          sx={{
            py: 1.8,
            fontSize: '1.05rem',
            fontWeight: 'bold',
            borderColor: hasSaves ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
            color: hasSaves ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
            '&:hover': {
              borderColor: 'white',
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.05)',
            },
            '&.Mui-disabled': {
              borderColor: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          게임 불러오기
          {hasSaves && (
            <Chip
              label={savedGames.length}
              size="small"
              sx={{ ml: 1, height: 20, bgcolor: '#2b6cb0', color: 'white', fontSize: '0.7rem' }}
            />
          )}
        </Button>
      </Box>

      <Dialog
        open={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        slotProps={{ paper: { sx: { bgcolor: '#0f2040', color: 'white', minWidth: 360 } } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>게임 불러오기</DialogTitle>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <DialogContent sx={{ px: 0, py: 0 }}>
          <List disablePadding>
            {savedGames.map((save, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
                }}
              >
                <ListItemButton
                  onClick={() => handleLoad(save)}
                  sx={{ flex: 1, px: 3, py: 2 }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {teamLogoSrc(save.userTeamId) && (
                          <Box
                            component="img"
                            src={teamLogoSrc(save.userTeamId)}
                            alt={save.userTeamName}
                            sx={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                          />
                        )}
                        <Typography sx={{ fontWeight: 'bold', color: 'white' }}>
                          {save.userTeamName} — {save.ssntYr}년
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        저장: {new Date(save.savedAt).toLocaleString('ko-KR')}
                      </Typography>
                    }
                  />
                </ListItemButton>
                <Tooltip title="게임 삭제" placement="left">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleDelete(save) }}
                    sx={{ mr: 1.5, color: 'rgba(255,255,255,0.35)', '&:hover': { color: '#f87171' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
