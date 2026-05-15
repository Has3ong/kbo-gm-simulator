import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Divider, CircularProgress, Radio, RadioGroup,
  FormControlLabel, FormControl,
} from '@mui/material'
import { useState } from 'react'
import type { Stdm, StdmExpnCost } from '../types/team'
import { useExpandStadium } from '../hooks/useTeams'

interface Props {
  open: boolean
  onClose: () => void
  tmId: number
  stadium: Stdm
  costs: StdmExpnCost[]
  ciClr: string
}

export default function StdmExpnModal({ open, onClose, tmId, stadium, costs, ciClr }: Props) {
  const [selectedStep, setSelectedStep] = useState<number | null>(costs[0]?.expnStep ?? null)
  const mutation = useExpandStadium(tmId, onClose)

  const selected = costs.find((c) => c.expnStep === selectedStep)

  const handleSubmit = () => {
    if (selectedStep != null) mutation.mutate(selectedStep)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>경기장 증축</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>현재 수용인원</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {stadium.stdmSeatCnt?.toLocaleString() ?? '-'}석
          </Typography>
        </Box>
        <Divider />
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>증축 옵션 선택</Typography>
        <FormControl>
          <RadioGroup
            value={selectedStep ?? ''}
            onChange={(_, v) => setSelectedStep(Number(v))}
          >
            {costs.map((c) => (
              <Box
                key={c.expnStep}
                sx={{
                  border: '1px solid',
                  borderColor: selectedStep === c.expnStep ? ciClr : 'divider',
                  borderRadius: 1, p: 1.5, mb: 1,
                  bgcolor: selectedStep === c.expnStep ? `${ciClr}10` : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedStep(c.expnStep)}
              >
                <FormControlLabel
                  value={c.expnStep}
                  control={<Radio size="small" sx={{ color: ciClr, '&.Mui-checked': { color: ciClr } }} />}
                  label=""
                  sx={{ m: 0 }}
                />
                <Box sx={{ display: 'inline-block', ml: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    +{c.addSeatCnt.toLocaleString()}석 → {((stadium.stdmSeatCnt ?? 0) + c.addSeatCnt).toLocaleString()}석
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {c.expnDesc} · {c.expnCost.toLocaleString()}만원 · {c.expnDays}일
                  </Typography>
                </Box>
              </Box>
            ))}
          </RadioGroup>
        </FormControl>
        {selected && (
          <>
            <Divider />
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Row label="증축 비용" value={`${selected.expnCost.toLocaleString()}만원`} bold />
              <Row label="공사 기간" value={`${selected.expnDays}일`} />
              <Row label="증축 후 좌석수" value={`${((stadium.stdmSeatCnt ?? 0) + selected.addSeatCnt).toLocaleString()}석`} bold />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>취소</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={mutation.isPending || selectedStep == null}
          startIcon={mutation.isPending ? <CircularProgress size={16} /> : undefined}
          sx={{ bgcolor: ciClr }}
        >
          증축 시작
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
