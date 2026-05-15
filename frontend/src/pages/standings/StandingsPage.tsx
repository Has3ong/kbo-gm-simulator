import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
  Paper,
} from '@mui/material'
import { useStandingsPage } from './StandingsPageHooks'
import { useTeamMeta } from '../../hooks/useTeamMeta'


export default function StandingsPage() {
  const { standings, isLoading, ssntYr, setSsntYr, formatPct, formatGb, formatStrk, formatPythag } =
    useStandingsPage()
  const { getByTmId } = useTeamMeta()

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>순위표</Typography>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>시즌</InputLabel>
          <Select value={ssntYr} label="시즌" onChange={(e) => setSsntYr(Number(e.target.value))}>
            {[2026, 2025, 2024].map((y) => <MenuItem key={y} value={y}>{y}년</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {['순위', '구단', '승', '패', '무', '승률', '피타고리안', '게임차', '최근10', '연속', '득점', '실점', '득실'].map((h) => (
                  <TableCell key={h} align={['순위', '구단'].includes(h) ? 'left' : 'center'} sx={{ fontWeight: 'bold' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {standings?.map((s) => {
                const meta = getByTmId(s.tmId)
                const ciClr = meta?.ciClr ?? undefined
                const emblem = meta?.emblemCd ? `/img/logo/${meta.emblemCd}` : null
                return (
                <TableRow key={s.tmId} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 'bold', color: s.stndRnk === 1 ? 'warning.main' : 'inherit' }}>
                      {s.stndRnk ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {emblem && (
                        <Box
                          component="img"
                          src={emblem}
                          alt={s.tmShrtKrNm ?? ''}
                          sx={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      {ciClr && (
                        <Box sx={{ width: 4, height: 24, bgcolor: ciClr, borderRadius: 1, flexShrink: 0 }} />
                      )}
                      <RouterLink to={`/teams/${s.tmId}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>
                        {s.tmKrNm}
                      </RouterLink>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{s.w}</TableCell>
                  <TableCell align="center">{s.l}</TableCell>
                  <TableCell align="center">{s.t}</TableCell>
                  <TableCell align="center">{formatPct(s.pct)}</TableCell>
                  <TableCell align="center">{formatPythag(s.rs, s.ra)}</TableCell>
                  <TableCell align="center">{formatGb(s.gb)}</TableCell>
                  <TableCell align="center">{s.l10W}-{s.l10L}-{s.l10T}</TableCell>
                  <TableCell align="center">{formatStrk(s.strkType, s.strkCnt)}</TableCell>
                  <TableCell align="center">{s.rs ?? '-'}</TableCell>
                  <TableCell align="center">{s.ra ?? '-'}</TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'medium',
                        color: (s.runDiff ?? 0) > 0 ? 'success.main' : (s.runDiff ?? 0) < 0 ? 'error.main' : 'inherit',
                      }}
                    >
                      {(s.runDiff ?? 0) > 0 ? `+${s.runDiff}` : s.runDiff}
                    </Typography>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
