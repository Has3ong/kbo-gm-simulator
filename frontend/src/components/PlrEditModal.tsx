import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Slider, Typography, Box, Divider, Grid, CircularProgress, Alert,
} from '@mui/material'
import type { Player, PlrAblt, PlrPosn, PlrFatgCond } from '../types/player'
import { usePlrEdit } from '../hooks/usePlayers'
import { CURRENT_SEASON_YEAR } from '../constants'

interface Props {
  open: boolean
  onClose: () => void
  player: Player
  abilities: PlrAblt[]
  positions: PlrPosn[]
  fatgCond: PlrFatgCond | null | undefined
}

export default function PlrEditModal({ open, onClose, player, abilities, positions, fatgCond }: Props) {
  const [fatg, setFatg] = useState(fatgCond?.fatg ?? 30)
  const [cond, setCond] = useState(fatgCond?.cond ?? 70)
  const [potAblt, setPotAblt] = useState(player.plrPotAblt ?? 50)
  const [abltMap, setAbltMap] = useState<Record<string, number>>({})
  const [posnMap, setPosnMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (open) {
      setFatg(fatgCond?.fatg ?? 30)
      setCond(fatgCond?.cond ?? 70)
      setPotAblt(player.plrPotAblt ?? 50)
      setAbltMap(Object.fromEntries(abilities.map((a) => [a.abltCd, a.abltVal])))
      setPosnMap(Object.fromEntries(positions.map((p) => [p.posnCd, p.posnPrfcAblt])))
    }
  }, [open, fatgCond, player, abilities, positions])

  const editMutation = usePlrEdit(player.plrId, onClose)

  const handleSubmit = () => {
    editMutation.mutate({
      ssntYr: CURRENT_SEASON_YEAR,
      fatg,
      cond,
      potAblt,
      abilities: abltMap,
      positions: posnMap,
    })
  }

  const abltVals = Object.values(abltMap)
  const ovrlPreview = abltVals.length > 0
    ? Math.round(abltVals.reduce((s, v) => s + v, 0) / abltVals.length)
    : (player.plrOvrlAblt ?? '-')
  const ovrlExceedsPot = typeof ovrlPreview === 'number' && ovrlPreview > potAblt

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>선수 정보 수정 — {player.plrNm}</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>피로도 / 컨디션</Typography>
          <SliderRow label={`피로도 ${fatg}`} value={fatg} min={1} max={100} color="error"
            onChange={setFatg} />
          <SliderRow label={`컨디션 ${cond}`} value={cond} min={1} max={100} color="success"
            onChange={setCond} />
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>능력치</Typography>
          <SliderRow label={`잠재능력치 ${potAblt}`} value={potAblt} min={20} max={80} color="secondary"
            onChange={setPotAblt} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, pl: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>종합능력치 (자동계산)</Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: ovrlExceedsPot ? 'error.main' : 'inherit' }}>{ovrlPreview}</Typography>
          </Box>
          {ovrlExceedsPot && (
            <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>
              종합능력치({ovrlPreview})가 잠재능력치({potAblt})를 초과합니다.
            </Alert>
          )}
        </Box>

        {abilities.length > 0 && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>개별 능력치</Typography>
              <Grid container spacing={0.5}>
                {abilities.map((a) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={a.abltCd}>
                    <SliderRow
                      label={`${a.abltNm ?? a.abltCd} ${abltMap[a.abltCd] ?? a.abltVal}`}
                      value={abltMap[a.abltCd] ?? a.abltVal}
                      min={20} max={80} color="primary"
                      onChange={(v) => setAbltMap((prev) => ({ ...prev, [a.abltCd]: v }))}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}

        {positions.length > 0 && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>포지션 숙련도</Typography>
              <Grid container spacing={0.5}>
                {positions.map((p) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={p.posnCd}>
                    <SliderRow
                      label={`${p.posnNm ?? p.posnCd} ${posnMap[p.posnCd] ?? p.posnPrfcAblt}`}
                      value={posnMap[p.posnCd] ?? p.posnPrfcAblt}
                      min={20} max={80} color="info"
                      onChange={(v) => setPosnMap((prev) => ({ ...prev, [p.posnCd]: v }))}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={editMutation.isPending}>취소</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={editMutation.isPending || ovrlExceedsPot}
          startIcon={editMutation.isPending ? <CircularProgress size={16} /> : undefined}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function SliderRow({
  label, value, min, max, color, onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  color: 'error' | 'success' | 'primary' | 'secondary' | 'info'
  onChange: (v: number) => void
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography variant="caption" sx={{ minWidth: 130, flexShrink: 0 }}>{label}</Typography>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        color={color}
        onChange={(_, v) => onChange(v as number)}
        sx={{ flex: 1 }}
      />
    </Box>
  )
}
