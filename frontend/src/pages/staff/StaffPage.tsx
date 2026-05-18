import {
  Box, CircularProgress,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Chip, Typography,
} from '@mui/material'
import { useStaffPage } from './StaffPageHooks'

const STFF_TYPE_COLOR: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  MGR:   'primary',
  HCCH:  'secondary',
  COACH: 'default',
  SCUT:  'success',
  MED:   'warning',
  SCI:   'info',
  YUTH:  'default',
  ANLY:  'default',
}

export default function StaffPage() {
  const {
    staffs, isLoading,
    STFF_TYPE_LABEL,
  } = useStaffPage()

  return (
    <Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>이름</TableCell>
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
