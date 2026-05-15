import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, CircularProgress,
  FormControl, InputLabel, Select, MenuItem,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Chip,
} from '@mui/material'
import { useStaffPage } from './StaffPageHooks'

const STFF_TYPE_COLOR: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning'> = {
  MGR: 'primary', COACH: 'secondary', SCUT: 'success', MED: 'warning', ANLY: 'default',
}

export default function StaffPage() {
  const {
    teams, staffs, isLoading,
    selectedTmId, stffTypeCd,
    handleTmChange, handleTypeChange,
    STFF_TYPE_LABEL,
  } = useStaffPage()

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>스태프</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>구단</InputLabel>
          <Select value={selectedTmId ?? ''} label="구단" onChange={(e) => handleTmChange(String(e.target.value))}>
            <MenuItem value="">전체 구단</MenuItem>
            {teams?.map((t) => <MenuItem key={t.tmId} value={t.tmId}>{t.tmKrNm}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>직종</InputLabel>
          <Select value={stffTypeCd ?? ''} label="직종" onChange={(e) => handleTypeChange(String(e.target.value))}>
            <MenuItem value="">전체 직종</MenuItem>
            {Object.entries(STFF_TYPE_LABEL).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
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
                <TableCell sx={{ fontWeight: 'bold' }}>직종</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>경력</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>연봉(만원)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffs?.map((s) => (
                <TableRow key={s.stffId} hover>
                  <TableCell>
                    {s.stffNm}
                    {s.stffFrgnYn === '1' && (
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>(외)</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {s.tmId
                      ? <RouterLink to={`/teams/${s.tmId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{s.tmKrNm}</RouterLink>
                      : <Typography variant="body2" sx={{ color: 'text.secondary' }}>-</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STFF_TYPE_LABEL[s.stffTypeCd ?? ''] ?? '-'}
                      size="small"
                      color={STFF_TYPE_COLOR[s.stffTypeCd ?? ''] ?? 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {s.stffExpYr != null ? `${s.stffExpYr}년` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {s.stffAnslSal?.toLocaleString() ?? '-'}
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
