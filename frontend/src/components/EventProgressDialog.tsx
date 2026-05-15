import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  LinearProgress,
  Typography,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export interface EventProgress {
  step: number
  total: number
  message: string
  done: boolean
  error?: string
}

interface Props {
  open: boolean
  title: string
  stepLabels: string[]
  progress: EventProgress | null
  onClose?: () => void
}

export default function EventProgressDialog({ open, title, stepLabels, progress, onClose }: Props) {
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: '#0d1f3c', color: 'white', borderRadius: 3, p: 1 } } }}
    >
      <DialogContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          {title}
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
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progress.done ? '#68d391' : '#63b3ed',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {stepLabels.map((label, i) => {
                const stepNo = i + 1
                const done = progress.step >= stepNo
                const current = progress.step === stepNo - 1 && !progress.done
                return (
                  <Box key={stepNo} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        flexShrink: 0,
                        bgcolor: done
                          ? '#68d391'
                          : current
                          ? '#63b3ed'
                          : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {current && <CircularProgress size={12} sx={{ color: 'white' }} />}
                      {done && <CheckCircleIcon sx={{ fontSize: 14, color: '#0d1f3c' }} />}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: done ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}
                    >
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

            {(progress.done || progress.error) && onClose && (
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
