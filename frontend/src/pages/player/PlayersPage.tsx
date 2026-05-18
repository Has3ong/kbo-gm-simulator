import { Link as RouterLink } from 'react-router-dom'
import {
  Box, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  Chip, Tooltip,
} from '@mui/material'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { formatSalary } from '../../utils/format'
import { usePlayersPage } from './PlayersPageHooks'

const STATUS_COLOR: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
  ACT: 'success', INJ: 'error', REL: 'default', RET: 'default',
}

export default function PlayersPage() {
  const {
    players, isLoading,
    PLR_STTS_LABEL, REPR_POSN_LABEL,
  } = usePlayersPage()

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
                <TableCell sx={{ fontWeight: 'bold' }}>포지션</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>종합능력치</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>상태</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>연봉</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players?.map((p) => (
                <TableRow key={p.plrId} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <RouterLink to={`/players/${p.plrId}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>
                        {p.plrNm}
                      </RouterLink>
                      {p.plrFrgnYn === '1' && (
                        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>(외)</Box>
                      )}
                      {p.plrSttsCd === 'INJ' && (
                        <Tooltip
                          title={
                            p.injElapsedDays != null
                              ? (p.injElapsedDays >= 30 ? `중부상(${p.injElapsedDays}일 경과)` : `경부상(${p.injElapsedDays}일 경과)`)
                              : '부상'
                          }
                          arrow
                        >
                          <LocalHospitalIcon
                            sx={{
                              fontSize: 16,
                              color: p.injElapsedDays != null && p.injElapsedDays >= 30 ? 'error.main' : 'warning.main',
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{REPR_POSN_LABEL[p.reprPosnCd ?? ''] ?? '-'}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{p.plrOvrlAblt ?? '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={PLR_STTS_LABEL[p.plrSttsCd ?? ''] ?? '-'}
                      size="small"
                      color={STATUS_COLOR[p.plrSttsCd ?? ''] ?? 'default'}
                    />
                  </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
