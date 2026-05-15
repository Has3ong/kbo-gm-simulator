import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, Grid, Paper, Divider,
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, LinearProgress, Tooltip,
} from '@mui/material'
import { useRosterPage } from './RosterPageHooks'
import type { RosterPlayer } from '../../api/rosterApi'

export default function RosterPage() {
  const {
    teams, pitchers, catchers, infielders, outfielders,
    isLoading, selectedTmId, handleTeamChange,
  } = useRosterPage()

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>구단 로스터</Typography>

      <FormControl size="small" sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel>구단 선택</InputLabel>
        <Select
          value={selectedTmId ?? ''}
          label="구단 선택"
          onChange={(e) => handleTeamChange(String(e.target.value))}
        >
          {teams?.map((t) => <MenuItem key={t.tmId} value={t.tmId}>{t.tmKrNm}</MenuItem>)}
        </Select>
      </FormControl>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <RosterSection title={`투수진 (${pitchers.length}명)`} players={pitchers} />
          <RosterSection title={`포수 (${catchers.length}명)`} players={catchers} />
          <RosterSection title={`내야수 (${infielders.length}명)`} players={infielders} />
          <RosterSection title={`외야수/DH (${outfielders.length}명)`} players={outfielders} />
        </Grid>
      )}
    </Box>
  )
}

function CondBar({ value, type }: { value: number | null; type: 'fatg' | 'cond' }) {
  if (value == null) return <Typography variant="caption" sx={{ color: 'text.disabled' }}>-</Typography>
  const color = type === 'fatg'
    ? value >= 80 ? 'error.main' : value >= 60 ? 'warning.main' : 'success.main'
    : value >= 70 ? 'success.main' : value >= 40 ? 'warning.main' : 'error.main'
  return (
    <Tooltip title={`${type === 'fatg' ? '피로도' : '컨디션'}: ${value}`} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: 60 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            flex: 1, height: 5, borderRadius: 3,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
          }}
        />
        <Typography variant="caption" sx={{ fontSize: 10, minWidth: 18, color: 'text.secondary' }}>
          {value}
        </Typography>
      </Box>
    </Tooltip>
  )
}

function RosterSection({ title, players }: { title: string; players: RosterPlayer[] }) {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{title}</Typography>
        <Divider sx={{ mb: 1 }} />
        {players.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>선수 없음</Typography>
        ) : (
          <>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5, mb: 0.25 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>선수</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', width: 32, textAlign: 'center' }}>OVR</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', width: 70, textAlign: 'center' }}>피로도</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', width: 70, textAlign: 'center' }}>컨디션</Typography>
              </Box>
            </Box>
            {players.map((p) => (
              <Box
                key={p.plrId}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                  <RouterLink to={`/players/${p.plrId}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>
                    {p.plrNm}
                  </RouterLink>
                  {p.plrFrgnYn === '1' && (
                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>(외)</Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', width: 32, textAlign: 'center' }}>
                    {p.plrOvrlAblt ?? '-'}
                  </Typography>
                  <Box sx={{ width: 70 }}><CondBar value={p.fatg} type="fatg" /></Box>
                  <Box sx={{ width: 70 }}><CondBar value={p.cond} type="cond" /></Box>
                </Box>
              </Box>
            ))}
          </>
        )}
      </Paper>
    </Grid>
  )
}
