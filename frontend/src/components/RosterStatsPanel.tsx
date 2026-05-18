import {
  Box, Typography, Tab, Tabs, IconButton, Popover, Checkbox,
  FormControlLabel, CircularProgress, Table, TableHead, TableBody,
  TableRow, TableCell, TableSortLabel, Divider, Chip,
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import { Link as RouterLink } from 'react-router-dom'
import { useState, useMemo, useCallback } from 'react'
import { useRosterStats } from '../hooks/useRosterStats'
import type { BatterSeasonStat, PitcherSeasonStat } from '../api/rosterApi'

// ============================================================
// 컬럼 정의
// ============================================================

interface ColDef {
  key: string
  label: string
  desc: string
  defaultOn: boolean
  format?: (v: number | null) => string
}

const fmt3 = (v: number | null) => v == null ? '-' : v.toFixed(3).replace(/^0/, '')
const fmt2 = (v: number | null) => v == null ? '-' : v.toFixed(2)
const fmtN = (v: number | null) => v == null || v === 0 ? '0' : String(v)
const fmtIp = (v: number | null) => {
  if (v == null) return '-'
  return `${Math.floor(v / 3)}.${v % 3}`
}

const BATTER_COLS: ColDef[] = [
  { key: 'G',    label: 'G',   desc: '출장',   defaultOn: true,  format: fmtN },
  { key: 'PA',   label: 'PA',  desc: '타석',   defaultOn: true,  format: fmtN },
  { key: 'AB',   label: 'AB',  desc: '타수',   defaultOn: false, format: fmtN },
  { key: 'H',    label: 'H',   desc: '안타',   defaultOn: true,  format: fmtN },
  { key: 'DOBL', label: '2B',  desc: '2루타',  defaultOn: true,  format: fmtN },
  { key: 'TRPL', label: '3B',  desc: '3루타',  defaultOn: true,  format: fmtN },
  { key: 'HR',   label: 'HR',  desc: '홈런',   defaultOn: true,  format: fmtN },
  { key: 'RBI',  label: 'RBI', desc: '타점',   defaultOn: true,  format: fmtN },
  { key: 'R',    label: 'R',   desc: '득점',   defaultOn: true,  format: fmtN },
  { key: 'BB',   label: 'BB',  desc: '볼넷',   defaultOn: true,  format: fmtN },
  { key: 'SO',   label: 'K',   desc: '삼진',   defaultOn: false, format: fmtN },
  { key: 'SB',   label: 'SB',  desc: '도루',   defaultOn: true,  format: fmtN },
  { key: 'CS',   label: 'CS',  desc: '도루실패', defaultOn: false, format: fmtN },
  { key: 'HBP',  label: 'HBP', desc: '사구',   defaultOn: false, format: fmtN },
  { key: 'BA',   label: 'AVG', desc: '타율',   defaultOn: true,  format: fmt3 },
  { key: 'OBP',  label: 'OBP', desc: '출루율', defaultOn: true,  format: fmt3 },
  { key: 'SLG',  label: 'SLG', desc: '장타율', defaultOn: true,  format: fmt3 },
  { key: 'OPS',  label: 'OPS', desc: 'OPS',   defaultOn: true,  format: fmt3 },
]

const PITCHER_COLS: ColDef[] = [
  { key: 'G',      label: 'G',    desc: '등판',   defaultOn: true,  format: fmtN },
  { key: 'GS',     label: 'GS',   desc: '선발',   defaultOn: false, format: fmtN },
  { key: 'W',      label: 'W',    desc: '승',     defaultOn: true,  format: fmtN },
  { key: 'L',      label: 'L',    desc: '패',     defaultOn: true,  format: fmtN },
  { key: 'SV',     label: 'SV',   desc: '세이브', defaultOn: true,  format: fmtN },
  { key: 'HLD',    label: 'HLD',  desc: '홀드',   defaultOn: true,  format: fmtN },
  { key: 'IP_OUT', label: 'IP',   desc: '이닝',   defaultOn: true,  format: fmtIp },
  { key: 'ERA',    label: 'ERA',  desc: '방어율', defaultOn: true,  format: fmt2 },
  { key: 'WHIP',   label: 'WHIP', desc: 'WHIP',  defaultOn: false, format: fmt2 },
  { key: 'H',      label: 'H',    desc: '피안타', defaultOn: false, format: fmtN },
  { key: 'HR',     label: 'HR',   desc: '피홈런', defaultOn: false, format: fmtN },
  { key: 'R',      label: '실점', desc: '실점',   defaultOn: true,  format: fmtN },
  { key: 'ER',     label: 'ER',   desc: '자책',   defaultOn: false, format: fmtN },
  { key: 'BB',     label: 'BB',   desc: '볼넷',     defaultOn: true,  format: fmtN },
  { key: 'SO',     label: 'K',    desc: '삼진',     defaultOn: true,  format: fmtN },
  { key: 'QS',     label: 'QS',   desc: 'QS',      defaultOn: false, format: fmtN },
  { key: 'CG',     label: 'CG',   desc: '완투',     defaultOn: false, format: fmtN },
  { key: 'SHO',    label: 'SHO',  desc: '완봉',     defaultOn: false, format: fmtN },
  { key: 'NH',     label: 'NH',   desc: '노히트',   defaultOn: false, format: fmtN },
  { key: 'PG',     label: 'PG',   desc: '퍼펙트',   defaultOn: false, format: fmtN },
]

const POSN_SHORT: Record<string, string> = {
  '10': '선발', '11': '계투', '12': '마무리',
  '20': '포수', '21': '1루', '22': '2루', '23': '3루',
  '24': '유격', '25': '좌익', '26': '중견', '27': '우익', '28': 'DH',
}

// ============================================================
// 컬럼 선택기
// ============================================================

interface ColSelectorProps {
  cols: ColDef[]
  visible: Set<string>
  onToggle: (key: string) => void
}

function ColSelector({ cols, visible, onToggle }: ColSelectorProps) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ ml: 0.5 }}
        title="표시할 항목 선택"
      >
        <TuneIcon fontSize="small" />
      </IconButton>

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 1.5, minWidth: 200 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
            표시할 항목 선택
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
            {cols.map((col) => (
              <FormControlLabel
                key={col.key}
                control={
                  <Checkbox
                    size="small"
                    checked={visible.has(col.key)}
                    onChange={() => onToggle(col.key)}
                    sx={{ p: 0.5 }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: 12 }}>{col.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>{col.desc}</Typography>
                  </Box>
                }
                sx={{ m: 0, width: '50%', '& .MuiFormControlLabel-label': { ml: 0 } }}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </>
  )
}

// ============================================================
// 정렬 유틸
// ============================================================

type SortDir = 'asc' | 'desc'

function sortRows<T>(rows: T[], key: string, dir: SortDir): T[] {
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key] as number | null
    const bv = (b as Record<string, unknown>)[key] as number | null
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    return dir === 'asc' ? av - bv : bv - av
  })
}

// ============================================================
// 타자 테이블
// ============================================================

function BatterTable({
  rows, visibleCols,
}: {
  rows: BatterSeasonStat[]
  visibleCols: Set<string>
}) {
  const [sortKey, setSortKey] = useState('PA')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = useCallback((key: string) => {
    setSortDir((prev) => sortKey === key ? (prev === 'desc' ? 'asc' : 'desc') : 'desc')
    setSortKey(key)
  }, [sortKey])

  const activeCols = BATTER_COLS.filter((c) => visibleCols.has(c.key))
  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir])

  if (rows.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.disabled', py: 2, textAlign: 'center' }}>기록 없음</Typography>
  }

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Table size="small" sx={{ tableLayout: 'auto', minWidth: 300 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 'bold', fontSize: 11, py: 0.5, px: 1, whiteSpace: 'nowrap', position: 'sticky', left: 0, bgcolor: 'grey.50', zIndex: 1 }}>
              이름
            </TableCell>
            {activeCols.map((col) => (
              <TableCell key={col.key} align="right" sx={{ fontWeight: 'bold', fontSize: 11, py: 0.5, px: 0.75, whiteSpace: 'nowrap' }}>
                <TableSortLabel
                  active={sortKey === col.key}
                  direction={sortKey === col.key ? sortDir : 'desc'}
                  onClick={() => handleSort(col.key)}
                  sx={{ fontSize: 11, '& .MuiTableSortLabel-icon': { fontSize: 12 } }}
                >
                  <Box component="span" title={col.desc}>{col.label}</Box>
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.PLR_ID} hover sx={{ '& td': { py: 0.35, px: 0.75 } }}>
              <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1, whiteSpace: 'nowrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {row.POSN_CD && (
                    <Chip
                      label={POSN_SHORT[row.POSN_CD] ?? row.POSN_CD}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 10, height: 18, '& .MuiChip-label': { px: 0.5 }, flexShrink: 0 }}
                    />
                  )}
                  <RouterLink
                    to={`/players/${row.PLR_ID}`}
                    style={{ fontSize: 12, fontWeight: 'bold', color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    {row.PLR_NM}
                  </RouterLink>
                </Box>
              </TableCell>
              {activeCols.map((col) => {
                const v = row[col.key as keyof BatterSeasonStat] as number | null
                const display = col.format ? col.format(v) : (v ?? '-')
                const isRate = ['BA', 'OBP', 'SLG', 'OPS'].includes(col.key)
                const isGood = isRate && typeof v === 'number' && v >= (col.key === 'OPS' ? 0.800 : col.key === 'SLG' ? 0.450 : col.key === 'OBP' ? 0.360 : 0.300)
                return (
                  <TableCell key={col.key} align="right" sx={{
                    fontSize: 12,
                    fontWeight: isGood ? 'bold' : 'normal',
                    color: isGood ? 'primary.main' : 'text.primary',
                    whiteSpace: 'nowrap',
                  }}>
                    {display}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

// ============================================================
// 투수 테이블
// ============================================================

function PitcherTable({
  rows, visibleCols,
}: {
  rows: PitcherSeasonStat[]
  visibleCols: Set<string>
}) {
  const [sortKey, setSortKey] = useState('IP_OUT')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = useCallback((key: string) => {
    setSortDir((prev) => sortKey === key ? (prev === 'desc' ? 'asc' : 'desc') : (key === 'ERA' || key === 'WHIP' ? 'asc' : 'desc'))
    setSortKey(key)
  }, [sortKey])

  const activeCols = PITCHER_COLS.filter((c) => visibleCols.has(c.key))
  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir])

  if (rows.length === 0) {
    return <Typography variant="body2" sx={{ color: 'text.disabled', py: 2, textAlign: 'center' }}>기록 없음</Typography>
  }

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Table size="small" sx={{ tableLayout: 'auto', minWidth: 300 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 'bold', fontSize: 11, py: 0.5, px: 1, whiteSpace: 'nowrap', position: 'sticky', left: 0, bgcolor: 'grey.50', zIndex: 1 }}>
              이름
            </TableCell>
            {activeCols.map((col) => (
              <TableCell key={col.key} align="right" sx={{ fontWeight: 'bold', fontSize: 11, py: 0.5, px: 0.75, whiteSpace: 'nowrap' }}>
                <TableSortLabel
                  active={sortKey === col.key}
                  direction={sortKey === col.key ? sortDir : 'desc'}
                  onClick={() => handleSort(col.key)}
                  sx={{ fontSize: 11, '& .MuiTableSortLabel-icon': { fontSize: 12 } }}
                >
                  <Box component="span" title={col.desc}>{col.label}</Box>
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.PLR_ID} hover sx={{ '& td': { py: 0.35, px: 0.75 } }}>
              <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1, whiteSpace: 'nowrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {row.POSN_CD && (
                    <Chip
                      label={POSN_SHORT[row.POSN_CD] ?? row.POSN_CD}
                      size="small"
                      variant="outlined"
                      color="secondary"
                      sx={{ fontSize: 10, height: 18, '& .MuiChip-label': { px: 0.5 }, flexShrink: 0 }}
                    />
                  )}
                  <RouterLink
                    to={`/players/${row.PLR_ID}`}
                    style={{ fontSize: 12, fontWeight: 'bold', color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    {row.PLR_NM}
                  </RouterLink>
                </Box>
              </TableCell>
              {activeCols.map((col) => {
                const v = row[col.key as keyof PitcherSeasonStat] as number | null
                const display = col.format ? col.format(v) : (v ?? '-')
                const isEra = col.key === 'ERA' && typeof v === 'number'
                const isGoodEra = isEra && v < 3.00
                const isBadEra  = isEra && v >= 5.00
                return (
                  <TableCell key={col.key} align="right" sx={{
                    fontSize: 12,
                    fontWeight: isGoodEra ? 'bold' : 'normal',
                    color: isGoodEra ? 'success.main' : isBadEra ? 'error.main' : 'text.primary',
                    whiteSpace: 'nowrap',
                  }}>
                    {display}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

// ============================================================
// 메인 패널
// ============================================================

interface Props {
  tmId: number | undefined
  ssntYr: number
}

function initVisible(cols: ColDef[], storageKey: string): Set<string> {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) return new Set(JSON.parse(saved) as string[])
  } catch { /* ignore */ }
  return new Set(cols.filter((c) => c.defaultOn).map((c) => c.key))
}

export default function RosterStatsPanel({ tmId, ssntYr }: Props) {
  const [tab, setTab] = useState(0)
  const { data, isLoading } = useRosterStats(tmId, ssntYr)

  const [batterVisible, setBatterVisible] = useState<Set<string>>(
    () => initVisible(BATTER_COLS, 'rosterStats_batter_cols')
  )
  const [pitcherVisible, setPitcherVisible] = useState<Set<string>>(
    () => initVisible(PITCHER_COLS, 'rosterStats_pitcher_cols')
  )

  const toggleBatterCol = useCallback((key: string) => {
    setBatterVisible((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      localStorage.setItem('rosterStats_batter_cols', JSON.stringify([...next]))
      return next
    })
  }, [])

  const togglePitcherCol = useCallback((key: string) => {
    setPitcherVisible((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      localStorage.setItem('rosterStats_pitcher_cols', JSON.stringify([...next]))
      return next
    })
  }, [])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (!data) {
    return (
      <Typography variant="body2" sx={{ color: 'text.disabled', py: 2, px: 1 }}>
        기록 데이터를 불러올 수 없습니다.
      </Typography>
    )
  }

  const batters  = data.batters  ?? []
  const pitchers = data.pitchers ?? []

  return (
    <Box>
      {/* 탭 + 컬럼 선택 */}
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flex: 1, minHeight: 36 }}>
          <Tab
            label={`타자 (${batters.length}명)`}
            sx={{ fontSize: 12, minHeight: 36, py: 0 }}
          />
          <Tab
            label={`투수 (${pitchers.length}명)`}
            sx={{ fontSize: 12, minHeight: 36, py: 0 }}
          />
        </Tabs>
        {tab === 0 && (
          <ColSelector cols={BATTER_COLS} visible={batterVisible} onToggle={toggleBatterCol} />
        )}
        {tab === 1 && (
          <ColSelector cols={PITCHER_COLS} visible={pitcherVisible} onToggle={togglePitcherCol} />
        )}
      </Box>

      <Divider />

      <Box sx={{ pt: 0.5 }}>
        {tab === 0 && (
          <BatterTable rows={batters} visibleCols={batterVisible} />
        )}
        {tab === 1 && (
          <PitcherTable rows={pitchers} visibleCols={pitcherVisible} />
        )}
      </Box>
    </Box>
  )
}
