import {
  Box, CircularProgress, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Paper,
} from '@mui/material'
import { useSpringCampGrowth } from '../hooks/useSpringCampGrowth'
import type { SpringCampGrowthRow } from '../hooks/useSpringCampGrowth'

interface GrowthDetailTableProps {
  ssntYr: number
}

const ABLT_LABEL: Record<string, string> = {
  speed: '주루', arm: '어깨', fielding: '수비', contact: '컨택',
  power: '파워', eye: '선구안', stamina: '체력', control: '제구',
  stuff: '구위', velocity: '구속', break_ball: '변화구',
}

function getAbltLabel(abltCd: string): string {
  return ABLT_LABEL[abltCd] ?? abltCd
}

export default function GrowthDetailTable({ ssntYr }: GrowthDetailTableProps) {
  const { data, isLoading, isError } = useSpringCampGrowth(ssntYr, true)

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (isError || !data) {
    return (
      <Typography variant="body2" sx={{ color: 'error.main', mt: 1 }}>
        성장 데이터를 불러오지 못했습니다.
      </Typography>
    )
  }

  if (data.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1 }}>
        성장 기록이 없습니다.
      </Typography>
    )
  }

  // Sort by plrNm, abltCd
  const sorted = [...data].sort((a, b) => {
    if (a.plrNm < b.plrNm) return -1
    if (a.plrNm > b.plrNm) return 1
    if (a.abltCd < b.abltCd) return -1
    if (a.abltCd > b.abltCd) return 1
    return 0
  })

  // Group by player
  const grouped: { plrId: number; plrNm: string; rows: SpringCampGrowthRow[] }[] = []
  for (const row of sorted) {
    const last = grouped[grouped.length - 1]
    if (last && last.plrId === row.plrId) {
      last.rows.push(row)
    } else {
      grouped.push({ plrId: row.plrId, plrNm: row.plrNm, rows: [row] })
    }
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 'bold', width: 100 }}>선수명</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>능력치</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">성장전</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">성장후</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">증가</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grouped.map((group) =>
            group.rows.map((row, idx) => (
              <TableRow
                key={`${row.plrId}-${row.abltCd}`}
                sx={{ '&:last-child td': { border: 0 } }}
              >
                <TableCell sx={{ fontWeight: idx === 0 ? 'bold' : 'normal', color: idx === 0 ? 'text.primary' : 'transparent' }}>
                  {idx === 0 ? group.plrNm : ''}
                </TableCell>
                <TableCell>{getAbltLabel(row.abltCd)}</TableCell>
                <TableCell align="right">{row.abltValBfr}</TableCell>
                <TableCell align="right">{row.abltValAft}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={`+${row.delta}`}
                    size="small"
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      fontWeight: 'bold',
                      height: 20,
                      fontSize: 12,
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
