import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogContent,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link, useNavigate } from 'react-router-dom'
import { useNewGamePage } from './NewGamePageHooks'
import { BAT_PTCH_HAND_LABEL, isPitcher, type Player } from '../../types/player'
import { formatSalary } from '../../utils/format'

const REPR_POSN_ORDER: Record<string, number> = { '10': 0, '20': 1, '21': 2, '22': 3 }
const REPR_POSN_LABEL: Record<string, string> = {
  '10': '투수',
  '20': '포수',
  '21': '내야수',
  '22': '외야수',
}

function sortRoster(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const orderA = REPR_POSN_ORDER[a.reprPosnCd ?? ''] ?? 9
    const orderB = REPR_POSN_ORDER[b.reprPosnCd ?? ''] ?? 9
    if (orderA !== orderB) return orderA - orderB
    return (b.plrOvrlAblt ?? 0) - (a.plrOvrlAblt ?? 0)
  })
}

function OvrChip({ val }: { val: number | null }) {
  if (val == null) return <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>—</Typography>
  const color = val >= 70 ? '#f6c90e' : val >= 60 ? '#63b3ed' : val >= 50 ? '#68d391' : 'rgba(255,255,255,0.5)'
  return (
    <Typography variant="body2" sx={{ fontWeight: 'bold', color }}>
      {val}
    </Typography>
  )
}

export default function NewGamePage() {
  const navigate = useNavigate()
  const {
    teams,
    teamsLoading,
    selectedTeamId,
    setSelectedTeamId,
    selectedTeam,
    seasonYear,
    roster,
    rosterLoading,
    handleConfirm,
    canConfirm,
    starting,
    progress,
  } = useNewGamePage()

  const sortedRoster = sortRoster(roster)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a1628',
        color: 'white',
        px: { xs: 2, md: 6 },
        py: 5,
      }}
    >
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, '&:hover': { color: 'white' } }}
      >
        돌아가기
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        새 게임 시작
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
        {seasonYear}년 시즌 · 단장이 되어 이끌 구단을 선택하세요.
      </Typography>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 4 }} />

      {/* 팀 선택 */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        구단 선택
      </Typography>

      {teamsLoading ? (
        <CircularProgress sx={{ color: 'white' }} />
      ) : (
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {teams.map((team) => {
            const selected = team.tmId === selectedTeamId
            return (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={team.tmId}>
                <Card
                  sx={{
                    bgcolor: selected ? 'primary.main' : 'rgba(255,255,255,0.07)',
                    border: selected ? '2px solid #63b3ed' : '2px solid transparent',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: selected ? 'primary.main' : 'rgba(255,255,255,0.12)' },
                  }}
                >
                  <CardActionArea onClick={() => setSelectedTeamId(team.tmId)}>
                    <CardContent sx={{ position: 'relative', py: 2.5, textAlign: 'center' }}>
                      {selected && (
                        <CheckCircleIcon
                          sx={{ position: 'absolute', top: 8, right: 8, fontSize: 18, color: '#63b3ed' }}
                        />
                      )}
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {team.tmKrNm}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        {team.cityNm ?? ''}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          disabled={!canConfirm || starting}
          onClick={handleConfirm}
          sx={{
            px: 5,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
            bgcolor: '#2b6cb0',
            '&:hover': { bgcolor: '#2c5282' },
            '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' },
          }}
        >
          {canConfirm ? `${seasonYear}년 시즌 시작` : '구단을 선택하세요'}
        </Button>
      </Box>

      {/* 로스터 */}
      {selectedTeam && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {selectedTeam.tmKrNm} 로스터
              </Typography>
              {!rosterLoading && (
                <Chip
                  label={`${roster.length}명`}
                  size="small"
                  sx={{ bgcolor: 'rgba(99,179,237,0.2)', color: '#63b3ed', fontWeight: 'bold' }}
                />
              )}
            </Box>

            {rosterLoading ? (
              <CircularProgress sx={{ color: 'white' }} />
            ) : roster.length === 0 ? (
              <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>등록된 선수가 없습니다.</Typography>
            ) : (
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.06)' }}>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', width: '15%' }}>포지션</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', width: '20%' }}>이름</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', width: '12%' }}>투타</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', width: '10%', textAlign: 'center' }}>OVR</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', width: '18%', textAlign: 'right' }}>연봉</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedRoster.map((player) => (
                      <TableRow
                        key={player.plrId}
                        onClick={() => navigate(`/players/${player.plrId}`)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <TableCell sx={{ py: 0.8 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Chip
                              label={REPR_POSN_LABEL[player.reprPosnCd ?? ''] ?? '—'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                bgcolor: isPitcher(player.reprPosnCd)
                                  ? 'rgba(246,201,14,0.15)'
                                  : 'rgba(104,211,145,0.15)',
                                color: isPitcher(player.reprPosnCd) ? '#f6c90e' : '#68d391',
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 500, fontSize: '0.85rem', py: 0.8 }}>
                          {player.plrNm}
                          {player.plrFrgnYn === '1' && (
                            <Typography component="span" sx={{ ml: 0.5, fontSize: '0.7rem', color: '#f6ad55' }}>
                              외
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', py: 0.8 }}>
                          {BAT_PTCH_HAND_LABEL[player.plrBatPtchHandCd ?? ''] ?? '—'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 0.8 }}>
                          <OvrChip val={player.plrOvrlAblt} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', py: 0.8 }}>
                          {(() => {
                            const { display, tooltip } = formatSalary(player.plrAnslSal)
                            return (
                              <Tooltip title={tooltip} placement="left" arrow>
                                <span>{display}</span>
                              </Tooltip>
                            )
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* 시즌 시작 진행률 다이얼로그 */}
      <Dialog
        open={starting}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { bgcolor: '#0d1f3c', color: 'white', borderRadius: 3, p: 1 } } }}
      >
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            {seasonYear}년 시즌 시작 중...
          </Typography>

          {progress && (
            <>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {progress.message}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {progress.step} / {progress.total}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.round((progress.step / progress.total) * 100)}
                  sx={{
                    height: 8, borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: progress.done ? '#68d391' : '#63b3ed', borderRadius: 4 },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {STEP_LABELS.map((label, i) => {
                  const stepNo = i + 1
                  const done = progress.step >= stepNo
                  const current = progress.step === stepNo && !progress.done
                  return (
                    <Box key={stepNo} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        bgcolor: done ? '#68d391' : current ? '#63b3ed' : 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {current && <CircularProgress size={12} sx={{ color: 'white' }} />}
                        {done && <CheckCircleIcon sx={{ fontSize: 14, color: '#0d1f3c' }} />}
                      </Box>
                      <Typography variant="caption" sx={{ color: done ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}>
                        {label}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>

              {progress.error && (
                <Typography variant="body2" sx={{ color: '#fc8181', mt: 2, textAlign: 'center' }}>
                  {progress.error}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

const STEP_LABELS = [
  '팀 유효성 확인',
  '기존 데이터 초기화',
  '시즌 데이터 생성',
  '유저 팀 저장',
  '팀 시즌 상태 초기화',
  '로스터 초기화',
  '라인업 자동 생성',
  '선발 로테이션 생성',
  '불펜 역할 배정',
  '정규시즌 일정 생성',
  '시즌 캘린더 구성',
  '현재 날짜 설정 (2월 1일)',
  '시작 이벤트 생성',
  '시즌 시작 완료',
]
