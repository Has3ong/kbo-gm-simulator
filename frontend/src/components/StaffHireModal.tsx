import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Alert, CircularProgress,
  Checkbox, FormControlLabel, Divider, Tooltip, IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'
import { useCurrentStaff, useStaffCandidates, useHireStaff } from '../hooks/useStaffHire'
import type { Staff, StffCandidate } from '../types/staff'

interface Props {
  open: boolean
  onClose: () => void
  onHired: () => void
}

// 감독 능력치 코드 → 한글명 (고정 순서)
const MGR_ABLT_KEYS = ['TAC', 'MOT', 'MAN', 'DISC', 'DET', 'ADP'] as const
const MGR_ABLT_LABELS: Record<string, string> = {
  TAC: '전술', MOT: '동기부여', MAN: '관리력', DISC: '훈련', DET: '결단력', ADP: '적응력',
}

// 코치 능력치 코드 → 한글명 (고정 순서)
const COACH_ABLT_KEYS = ['TCNT', 'TTCH', 'TPWR', 'TCTL', 'TSTM', 'TVEL', 'TBRK', 'TRUN', 'TSTL', 'MOT', 'MAN'] as const
const COACH_ABLT_LABELS: Record<string, string> = {
  TCNT: '타격지도', TTCH: '투구지도', TPWR: '파워지도', TCTL: '컨트롤',
  TSTM: '스태미나', TVEL: '구속지도', TBRK: '변화구', TRUN: '주루지도',
  TSTL: '도루지도', MOT: '동기부여', MAN: '관리력',
}

function abltMap(abilities: { stffAbltCd: string; stffAbltVal: number }[]): Record<string, number> {
  return Object.fromEntries(abilities.map((a) => [a.stffAbltCd, a.stffAbltVal]))
}

function AbltCell({ val }: { val: number | undefined }) {
  if (val == null) return <TableCell align="center" sx={{ color: 'text.disabled' }}>-</TableCell>
  const color = val >= 18 ? '#c62828' : val >= 15 ? '#e65100' : val >= 12 ? '#1565c0' : 'text.primary'
  return <TableCell align="center" sx={{ fontWeight: val >= 15 ? 'bold' : 'normal', color }}>{val}</TableCell>
}

function OvrlChip({ val }: { val: number }) {
  const color = val >= 16 ? 'error' : val >= 13 ? 'warning' : val >= 10 ? 'info' : 'default'
  return <Chip label={val} color={color as 'error' | 'warning' | 'info' | 'default'} size="small" sx={{ fontWeight: 'bold', minWidth: 36 }} />
}

export default function StaffHireModal({ open, onClose, onHired }: Props) {
  const { data: currentStaff, isLoading: currentLoading } = useCurrentStaff(open)
  const { data: candidates, isLoading: candLoading } = useStaffCandidates(open)
  const hireMutation = useHireStaff()

  const [renewMgr, setRenewMgr] = useState(false)
  const [renewCoach, setRenewCoach] = useState(false)
  const [selectedMgrId, setSelectedMgrId] = useState<number | null>(null)
  const [selectedCoachIds, setSelectedCoachIds] = useState<number[]>([])

  const existingMgrs = (currentStaff?.mgr ?? []) as Staff[]
  const existingCoaches = (currentStaff?.coach ?? []) as Staff[]
  const mgrCandidates: StffCandidate[] = candidates?.mgr ?? []
  const coachCandidates: StffCandidate[] = candidates?.coach ?? []

  const hasMgr = existingMgrs.length > 0
  const hasCoach = existingCoaches.length > 0

  const needMgr = !hasMgr || !renewMgr
  const needCoach = existingCoaches.length < 2 || !renewCoach

  const canHire = (() => {
    if (renewMgr && renewCoach && hasMgr && hasCoach) return true
    if (needMgr && !selectedMgrId) return false
    if (needCoach && selectedCoachIds.length === 0) return false
    return true
  })()

  function toggleCoach(id: number) {
    setSelectedCoachIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    )
  }

  function handleHire() {
    hireMutation.mutate(
      {
        mgrCandId: renewMgr ? null : selectedMgrId,
        coachCandIds: renewCoach ? [] : selectedCoachIds,
        renewMgr,
        renewCoach,
      },
      {
        onSuccess: () => {
          onHired()
          onClose()
        },
      }
    )
  }

  const isLoading = currentLoading || candLoading

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', pr: 6 }}>
        감독·코치 선임
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 현재 스태프 */}
            {(hasMgr || hasCoach) && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>현재 소속 스태프</Typography>
                {hasMgr && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>감독</Typography>
                    {existingMgrs.map((s) => (
                      <Typography key={s.stffId} variant="body2">
                        {s.stffNm} (경력 {s.stffExpYr ?? 0}년, 연봉 {(s.stffAnslSal ?? 0).toLocaleString()}만원)
                      </Typography>
                    ))}
                    <FormControlLabel
                      control={<Checkbox checked={renewMgr} onChange={(e) => setRenewMgr(e.target.checked)} size="small" />}
                      label="현재 감독과 재계약"
                    />
                  </Box>
                )}
                {hasCoach && (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>코치</Typography>
                    {existingCoaches.map((s) => (
                      <Typography key={s.stffId} variant="body2">
                        {s.stffNm} (경력 {s.stffExpYr ?? 0}년, 연봉 {(s.stffAnslSal ?? 0).toLocaleString()}만원)
                      </Typography>
                    ))}
                    <FormControlLabel
                      control={<Checkbox checked={renewCoach} onChange={(e) => setRenewCoach(e.target.checked)} size="small" />}
                      label="현재 코치진과 재계약"
                    />
                  </Box>
                )}
                <Divider sx={{ mt: 1 }} />
              </Box>
            )}

            {/* 감독 후보 */}
            {needMgr && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  감독 후보 <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>1명 선임</Typography>
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' } }}>
                      <TableCell padding="checkbox" />
                      <TableCell>이름</TableCell>
                      <TableCell align="center">경력</TableCell>
                      <TableCell align="center">종합</TableCell>
                      <TableCell align="right">계약금</TableCell>
                      <TableCell align="right">연봉</TableCell>
                      {MGR_ABLT_KEYS.map((k) => (
                        <TableCell key={k} align="center">{MGR_ABLT_LABELS[k]}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mgrCandidates.map((c) => {
                      const aMap = abltMap(c.abilities)
                      return (
                        <TableRow
                          key={c.candId}
                          hover
                          selected={selectedMgrId === c.candId}
                          onClick={() => setSelectedMgrId(c.candId)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={selectedMgrId === c.candId} size="small" readOnly />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>{c.stffNm}</TableCell>
                          <TableCell align="center">{c.stffExpYr}년</TableCell>
                          <TableCell align="center"><OvrlChip val={c.ovrlRtg} /></TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{c.signBonus.toLocaleString()}만원</TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{c.anslSal.toLocaleString()}만원</TableCell>
                          {MGR_ABLT_KEYS.map((k) => <AbltCell key={k} val={aMap[k]} />)}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                </Box>
              </Box>
            )}

            {/* 코치 후보 */}
            {needCoach && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  코치 후보{' '}
                  <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                    최대 2명 선임 ({selectedCoachIds.length}/2)
                  </Typography>
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 1000 }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' } }}>
                      <TableCell padding="checkbox" />
                      <TableCell>이름</TableCell>
                      <TableCell align="center">경력</TableCell>
                      <TableCell align="center">종합</TableCell>
                      <TableCell align="right">계약금</TableCell>
                      <TableCell align="right">연봉</TableCell>
                      {COACH_ABLT_KEYS.map((k) => (
                        <TableCell key={k} align="center">{COACH_ABLT_LABELS[k]}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coachCandidates.map((c) => {
                      const isSelected = selectedCoachIds.includes(c.candId)
                      const disabled = !isSelected && selectedCoachIds.length >= 2
                      const aMap = abltMap(c.abilities)
                      return (
                        <TableRow
                          key={c.candId}
                          hover={!disabled}
                          selected={isSelected}
                          onClick={() => !disabled && toggleCoach(c.candId)}
                          sx={{ cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1 }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected} disabled={disabled} size="small" readOnly />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>{c.stffNm}</TableCell>
                          <TableCell align="center">{c.stffExpYr}년</TableCell>
                          <TableCell align="center"><OvrlChip val={c.ovrlRtg} /></TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{c.signBonus.toLocaleString()}만원</TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{c.anslSal.toLocaleString()}만원</TableCell>
                          {COACH_ABLT_KEYS.map((k) => <AbltCell key={k} val={aMap[k]} />)}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                </Box>
              </Box>
            )}

            {hireMutation.isError && (
              <Alert severity="error">
                {(hireMutation.error as Error)?.message ?? '계약 처리에 실패했습니다.'}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">닫기</Button>
        <Tooltip title={!canHire ? '감독과 코치를 선택해주세요' : ''} arrow>
          <span>
            <Button
              variant="contained"
              onClick={handleHire}
              disabled={!canHire || hireMutation.isPending}
            >
              {hireMutation.isPending ? <CircularProgress size={20} /> : '계약 완료'}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  )
}
