import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Divider, CircularProgress,
} from '@mui/material'
import type { FcltyUpgrCost } from '../types/team'
import { useUpgradeFacility } from '../hooks/useTeams'

interface Props {
  open: boolean
  onClose: () => void
  tmId: number
  cost: FcltyUpgrCost | null
  ciClr: string
}

export default function FcltyUpgrModal({ open, onClose, tmId, cost, ciClr }: Props) {
  const mutation = useUpgradeFacility(tmId, onClose)

  if (!cost) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>시설 업그레이드</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: ciClr }}>
          {cost.fcltyTypeNm}
        </Typography>
        {cost.fcltyDesc && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{cost.fcltyDesc}</Typography>
        )}
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Row label="현재 레벨" value={`Lv.${cost.fromLvl}`} />
          <Row label="업그레이드 후" value={`Lv.${cost.toLvl}`} bold />
          <Row label="비용" value={`${cost.upgrCost?.toLocaleString()}만원`} bold />
          <Row label="공사 기간" value={`${cost.upgrDays}일`} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>취소</Button>
        <Button
          variant="contained"
          onClick={() => mutation.mutate(cost.fcltyTypeCd)}
          disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={16} /> : undefined}
          sx={{ bgcolor: ciClr }}
        >
          업그레이드
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: bold ? 'bold' : 'normal' }}>{value}</Typography>
    </Box>
  )
}
