import { useState } from 'react'
import {
  Box, Typography, Paper, Grid, Button, Divider, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import { formatSalary } from '../utils/format'
import { useBrdcstSpnsrs, useCurrentBrdcstSpnsr, useSelectBrdcstSpnsr } from '../hooks/useBroadcast'
import type { BrdcstSpnsr } from '../types/broadcast'

const STATION_COLORS: Record<string, string> = {
  SBS: '#2563EB',
  KBS: '#DC2626',
  MBC: '#16A34A',
}

export default function BrdcstSpnsrSelect() {
  const { data: options = [], isLoading: loadingOptions } = useBrdcstSpnsrs()
  const { data: current } = useCurrentBrdcstSpnsr()
  const selectMutation = useSelectBrdcstSpnsr()
  const [confirm, setConfirm] = useState<BrdcstSpnsr | null>(null)

  const handleSelect = async () => {
    if (!confirm) return
    await selectMutation.mutateAsync(confirm.brdcstCd)
    setConfirm(null)
  }

  if (loadingOptions) return <CircularProgress size={20} />

  if (current) {
    const color = STATION_COLORS[current.brdcstCd] ?? 'primary.main'
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>방송국 스폰서</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={current.brdcstNm} sx={{ bgcolor: color, color: 'white', fontWeight: 'bold', fontSize: 14, px: 1 }} />
          <ContractDetail label="계약금" value={formatSalary(current.cntrctFee).display} />
          <ContractDetail label="승리 수당" value={`${current.winBonus.toLocaleString()}만/승`} />
          <ContractDetail label="포스트 수당" value={formatSalary(current.postBonus).display} />
          <ContractDetail label="우승 수당" value={formatSalary(current.ksBonus).display} />
        </Box>
      </Paper>
    )
  }

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'warning.50', borderColor: 'warning.main' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, color: 'warning.dark' }}>
          📺 방송국 스폰서를 선택하세요
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          계약금이 높을수록 안정적이지만, 성과 수당이 낮습니다. 시즌 중 변경 불가합니다.
        </Typography>
        <Grid container spacing={2}>
          {options.map((opt) => {
            const color = STATION_COLORS[opt.brdcstCd] ?? '#555'
            return (
              <Grid size={{ xs: 12, sm: 4 }} key={opt.brdcstCd}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2, cursor: 'pointer', borderTop: `4px solid ${color}`,
                    '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.15s',
                  }}
                  onClick={() => setConfirm(opt)}
                >
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color, mb: 1 }}>{opt.brdcstNm}</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <ContractDetail label="계약금" value={formatSalary(opt.cntrctFee).display} highlight />
                  <ContractDetail label="승리 수당" value={`${opt.winBonus.toLocaleString()}만/승`} />
                  <ContractDetail label="포스트 수당" value={formatSalary(opt.postBonus).display} />
                  <ContractDetail label="우승 수당" value={formatSalary(opt.ksBonus).display} />
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    sx={{ mt: 1.5, bgcolor: color, '&:hover': { bgcolor: color, opacity: 0.9 } }}
                    onClick={(e) => { e.stopPropagation(); setConfirm(opt) }}
                  >
                    선택
                  </Button>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      </Paper>

      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>스폰서 계약 확정</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{confirm?.brdcstNm}</strong>과 스폰서 계약을 체결하시겠습니까?<br />
            계약금 <strong>{confirm ? formatSalary(confirm.cntrctFee).display : ''}</strong>가 즉시 지급됩니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>취소</Button>
          <Button variant="contained" onClick={handleSelect} disabled={selectMutation.isPending}>
            확정
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function ContractDetail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: highlight ? 'bold' : 'normal' }}>{value}</Typography>
    </Box>
  )
}
