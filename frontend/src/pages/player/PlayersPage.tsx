import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  Chip, Tooltip,
} from '@mui/material'
import { formatSalary } from '../../utils/format'
import { usePlayersPage } from './PlayersPageHooks'

const STATUS_COLOR: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
  ACT: 'success', INJ: 'error', REL: 'default', RET: 'default',
}

export default function PlayersPage() {
  const {
    teams, players, isLoading,
    tmId, plrSttsCd,
    handleTmChange, handleSttsChange,
    PLR_STTS_LABEL, REPR_POSN_LABEL,
  } = usePlayersPage()

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>선수 목록</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>구단</InputLabel>
          <Select value={tmId ?? ''} label="구단" onChange={(e) => handleTmChange(String(e.target.value))}>
            <MenuItem value="">전체 구단</MenuItem>
            {teams?.map((t) => <MenuItem key={t.tmId} value={t.tmId}>{t.tmKrNm}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>상태</InputLabel>
          <Select value={plrSttsCd ?? ''} label="상태" onChange={(e) => handleSttsChange(String(e.target.value))}>
            <MenuItem value="">전체 상태</MenuItem>
            {Object.entries(PLR_STTS_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
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
                <TableCell sx={{ fontWeight: 'bold' }}>이름</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>구단</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>포지션</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>연봉</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>종합능력치</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players?.map((p) => (
                <TableRow key={p.plrId} hover>
                  <TableCell>
                    <RouterLink to={`/players/${p.plrId}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>
                      {p.plrNm}
                    </RouterLink>
                    {p.plrFrgnYn === '1' && (
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>(외)</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.tmId
                      ? <RouterLink to={`/teams/${p.tmId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.tmKrNm}</RouterLink>
                      : <Typography variant="body2" sx={{ color: 'text.secondary' }}>FA</Typography>}
                  </TableCell>
                  <TableCell>{REPR_POSN_LABEL[p.reprPosnCd ?? ''] ?? '-'}</TableCell>
                  <TableCell align="right">
                    {(() => {
                      const { display, tooltip } = formatSalary(p.plrAnslSal ?? null)
                      return (
                        <Tooltip title={tooltip} placement="left" arrow>
                          <span>{display}</span>
                        </Tooltip>
                      )
                    })()}
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontWeight: 'bold' }}>{p.plrOvrlAblt ?? '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={PLR_STTS_LABEL[p.plrSttsCd ?? ''] ?? '-'}
                      size="small"
                      color={STATUS_COLOR[p.plrSttsCd ?? ''] ?? 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
