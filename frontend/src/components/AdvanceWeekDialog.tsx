import {
  Box, Button, CircularProgress, Dialog, DialogContent,
  LinearProgress, Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

export interface AdvanceWeekProgress {
  processedDays: number
  totalDays: number
  currentDate: string
  dayOfWeek: string
  targetDate: string
  message: string
  done: boolean
  error?: string
  weeklyRequired: boolean
}

interface Props {
  open: boolean
  progress: AdvanceWeekProgress | null
  onClose?: () => void
}

const DAY_NAMES_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function buildDayList(
  targetDate: string,
  totalDays: number,
): Array<{ date: string; dayOfWeek: string }> {
  if (!targetDate || totalDays <= 0) return []
  const target = new Date(targetDate + 'T00:00:00')
  const days: Array<{ date: string; dayOfWeek: string }> = []
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(target)
    d.setDate(d.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    days.push({ date: `${yyyy}-${mm}-${dd}`, dayOfWeek: DAY_NAMES_KO[d.getDay()] })
  }
  return days
}

export default function AdvanceWeekDialog({ open, progress, onClose }: Props) {
  const days = buildDayList(progress?.targetDate ?? '', progress?.totalDays ?? 0)
  const processed = progress?.processedDays ?? 0
  const total = progress?.totalDays ?? 0
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0
  const isDone = progress?.done ?? false
  const hasError = !!progress?.error

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { bgcolor: '#0d1f3c', color: 'white', borderRadius: 3, p: 1, overflow: 'hidden' },
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2.5, textAlign: 'center' }}>
          다음주 월요일까지 진행 중...
        </Typography>

        {/* 현재 날짜 대형 표시 */}
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, mb: 0.5 }}>
            현재 처리 중
          </Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 'bold', letterSpacing: 2, lineHeight: 1.1 }}>
            {progress?.currentDate || '—'}
          </Typography>
          <Typography
            sx={{
              fontSize: 15, mt: 0.5,
              color: '#63b3ed',
              fontWeight: 'medium',
            }}
          >
            {progress?.dayOfWeek || ''}
          </Typography>
        </Box>

        {/* 진행률 바 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {progress?.message || '준비 중...'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              {processed} / {total}일
            </Typography>
          </Box>
          <LinearProgress
            variant={total > 0 ? 'determinate' : 'indeterminate'}
            value={pct}
            sx={{
              height: 7,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: isDone ? '#68d391' : '#63b3ed',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* 날짜별 진행 목록 */}
        {days.length > 0 && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(0,0,0,0.25)',
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {days.map((day, idx) => {
              const dayDone = idx < processed
              const dayCurrent = idx === processed && !isDone
              return (
                <Box
                  key={day.date}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 0.5,
                    borderBottom: idx < days.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'opacity 0.3s',
                    opacity: dayDone || dayCurrent ? 1 : 0.4,
                  }}
                >
                  {/* 상태 아이콘 */}
                  <Box sx={{ width: 20, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                    {dayDone ? (
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#68d391' }} />
                    ) : dayCurrent ? (
                      <CircularProgress size={16} sx={{ color: '#63b3ed' }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.2)' }} />
                    )}
                  </Box>

                  {/* 날짜 */}
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: dayCurrent ? 'bold' : 'normal',
                      color: dayDone
                        ? 'rgba(255,255,255,0.7)'
                        : dayCurrent
                        ? 'white'
                        : 'rgba(255,255,255,0.35)',
                      minWidth: 90,
                    }}
                  >
                    {day.date}
                  </Typography>

                  {/* 요일 */}
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: dayDone
                        ? 'rgba(255,255,255,0.45)'
                        : dayCurrent
                        ? '#63b3ed'
                        : 'rgba(255,255,255,0.2)',
                      fontWeight: dayCurrent ? 'bold' : 'normal',
                      minWidth: 44,
                    }}
                  >
                    {day.dayOfWeek}
                  </Typography>

                  {/* 상태 텍스트 */}
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: dayDone ? '#68d391' : dayCurrent ? '#63b3ed' : 'transparent',
                    }}
                  >
                    {dayDone ? '완료' : dayCurrent ? '처리 중...' : ''}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        )}

        {/* 목표 날짜 */}
        {progress?.targetDate && (
          <Typography
            sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', mb: 1 }}
          >
            목표: {progress.targetDate}{' '}
            {DAY_NAMES_KO[new Date(progress.targetDate + 'T00:00:00').getDay()]}
            {progress.weeklyRequired && !isDone && (
              <Box component="span" sx={{ ml: 1, color: '#f6ad55' }}>
                (완료 후 주간 처리 자동 실행)
              </Box>
            )}
          </Typography>
        )}

        {/* 에러 */}
        {progress?.error && (
          <Typography variant="body2" sx={{ color: '#fc8181', mt: 1.5, textAlign: 'center' }}>
            {progress.error}
          </Typography>
        )}

        {/* 닫기 버튼 (에러 시 또는 weeklyRequired=false인 완료 후) */}
        {((isDone && !progress?.weeklyRequired) || hasError) && onClose && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              닫기
            </Button>
          </Box>
        )}

        {/* weekly 자동 진행 안내 */}
        {isDone && progress?.weeklyRequired && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, color: '#f6ad55' }}>
              주간 처리를 시작합니다...
            </Typography>
            <CircularProgress size={16} sx={{ color: '#f6ad55', mt: 0.5 }} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}
