import { useState } from 'react'
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  CircularProgress, Chip, Divider, Paper,
} from '@mui/material'
import { useGames, useGameRecords } from '../hooks/useGames'
import type { BatterRecord, PitcherRecord } from '../types/game'
import { useTeamMeta } from '../hooks/useTeamMeta'

interface Props {
  ssntYr: number
  gameDt: string
  userTmId: number | null
}

function fmtIp(ipOut: number) {
  return `${Math.floor(ipOut / 3)}.${ipOut % 3}`
}

function fmtStat(v: number | null | undefined, dec = 3) {
  if (v == null) return '-'
  return v.toFixed(dec).replace(/^0/, '')
}

function calcObp(r: BatterRecord) {
  const d = r.ab + r.bb + r.hbp + r.sf
  return d > 0 ? ((r.h + r.bb + r.hbp) / d).toFixed(3).replace(/^0/, '') : '-'
}

function calcSlg(r: BatterRecord) {
  if (r.ab === 0) return '-'
  const singles = r.h - r.dobl - r.trpl - r.hr
  return ((singles + r.dobl * 2 + r.trpl * 3 + r.hr * 4) / r.ab).toFixed(3).replace(/^0/, '')
}

function calcOps(r: BatterRecord) {
  const d = r.ab + r.bb + r.hbp + r.sf
  const obp = d > 0 ? (r.h + r.bb + r.hbp) / d : 0
  const singles = r.h - r.dobl - r.trpl - r.hr
  const slg = r.ab > 0 ? (singles + r.dobl * 2 + r.trpl * 3 + r.hr * 4) / r.ab : 0
  return (obp + slg).toFixed(3).replace(/^0/, '')
}

const ROLE_LABEL: Record<string, string> = { SP: '선발', RP: '중계', CP: '마무리' }

export default function GameResultsPanel({ ssntYr, gameDt, userTmId }: Props) {
  const { data: games = [], isLoading } = useGames({ ssntYr, gameDt })
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const { getByTmId, getEmblemPath, getCiClr } = useTeamMeta()

  const completedGames = games.filter((g) => g.gameSttsCd === '03')
  const userGame = completedGames.find((g) => g.homeTmId === userTmId || g.awayTmId === userTmId)
  const activeGameId = selectedGameId ?? userGame?.gameId ?? completedGames[0]?.gameId ?? null
  const activeGame = completedGames.find((g) => g.gameId === activeGameId)

  const { data: records, isLoading: recLoading } = useGameRecords(activeGameId)

  const batters = records?.batters ?? []
  const pitchers = records?.pitchers ?? []

  const homeBatters  = batters.filter((r) => r.tmId === activeGame?.homeTmId)
  const awayBatters  = batters.filter((r) => r.tmId === activeGame?.awayTmId)
  const homePitchers = pitchers.filter((r) => r.tmId === activeGame?.homeTmId)
  const awayPitchers = pitchers.filter((r) => r.tmId === activeGame?.awayTmId)

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
  }
  if (completedGames.length === 0) {
    return <Typography variant="body2" color="text.secondary">완료된 경기가 없습니다.</Typography>
  }

  return (
    <Box>
      {/* 스코어보드 — 전 경기 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
        {completedGames.map((g) => {
          const isActive   = g.gameId === activeGameId
          const isUserGame = g.homeTmId === userTmId || g.awayTmId === userTmId
          const homeWon    = (g.homeScore ?? 0) > (g.awayScore ?? 0)
          const awayWon    = (g.awayScore ?? 0) > (g.homeScore ?? 0)
          const homeMeta   = getByTmId(g.homeTmId)
          const awayMeta   = getByTmId(g.awayTmId)
          const homeEmb    = getEmblemPath(homeMeta?.tmShrtEngNm)
          const awayEmb    = getEmblemPath(awayMeta?.tmShrtEngNm)
          const homeCi     = getCiClr(homeMeta?.tmShrtEngNm)
          const awayCi     = getCiClr(awayMeta?.tmShrtEngNm)

          return (
            <Paper
              key={g.gameId}
              variant="outlined"
              onClick={() => setSelectedGameId(g.gameId)}
              sx={{
                p: 1.5, cursor: 'pointer', minWidth: 190,
                border: isActive ? '2px solid' : '1px solid',
                borderColor: isActive ? 'primary.main' : 'divider',
                bgcolor: isActive ? 'primary.50' : isUserGame ? 'warning.50' : 'background.paper',
              }}
            >
              {isUserGame && (
                <Chip label="우리팀" size="small" color="warning" sx={{ mb: 0.5, height: 18, fontSize: 11 }} />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {homeEmb && <Box component="img" src={homeEmb} sx={{ width: 18, height: 18, objectFit: 'contain' }} />}
                  <Typography variant="body2" sx={{ fontWeight: homeWon ? 'bold' : 'normal', color: homeCi ?? 'text.primary', fontSize: 13 }}>
                    {g.homeTmKrNm}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mx: 0.5, fontSize: 16 }}>
                  <span style={{ color: homeWon ? '#1976d2' : 'inherit' }}>{g.homeScore ?? 0}</span>
                  {' : '}
                  <span style={{ color: awayWon ? '#1976d2' : 'inherit' }}>{g.awayScore ?? 0}</span>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: awayWon ? 'bold' : 'normal', color: awayCi ?? 'text.primary', fontSize: 13 }}>
                    {g.awayTmKrNm}
                  </Typography>
                  {awayEmb && <Box component="img" src={awayEmb} sx={{ width: 18, height: 18, objectFit: 'contain' }} />}
                </Box>
              </Box>
            </Paper>
          )
        })}
      </Box>

      {/* 선택 경기 선수 기록 */}
      {activeGame && (
        recLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 타자 기록 */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary', letterSpacing: 0.5 }}>
                타자 기록
              </Typography>
              <RecordBlock label={activeGame.homeTmKrNm}>
                <BatterTable rows={homeBatters} />
              </RecordBlock>
              <RecordBlock label={activeGame.awayTmKrNm} sx={{ mt: 1.5 }}>
                <BatterTable rows={awayBatters} />
              </RecordBlock>
            </Box>

            <Divider />

            {/* 투수 기록 */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary', letterSpacing: 0.5 }}>
                투수 기록
              </Typography>
              <RecordBlock label={activeGame.homeTmKrNm}>
                <PitcherTable rows={homePitchers} />
              </RecordBlock>
              <RecordBlock label={activeGame.awayTmKrNm} sx={{ mt: 1.5 }}>
                <PitcherTable rows={awayPitchers} />
              </RecordBlock>
            </Box>
          </Box>
        )
      )}
    </Box>
  )
}

function RecordBlock({ label, children, sx }: { label: string; children: React.ReactNode; sx?: object }) {
  return (
    <Box sx={sx}>
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {children}
    </Box>
  )
}

function BatterTable({ rows }: { rows: BatterRecord[] }) {
  if (rows.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>기록 없음</Typography>
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 540 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            {['선수', '타석', '안타', '2루타', '홈런', '타점', '득점', '볼넷', '삼진', '도루', '타율', '출루율', '장타율', 'OPS'].map((h) => (
              <TableCell key={h} align={h === '선수' ? 'left' : 'right'} sx={{ fontWeight: 'bold', fontSize: 11, py: 0.5, px: 1 }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.plrId} hover>
              <TableCell sx={{ fontWeight: r.hr > 0 || r.h >= 3 ? 'bold' : 'normal', fontSize: 12, py: 0.4, px: 1 }}>{r.plrNm}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.pa}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1, color: r.h >= 3 ? 'success.main' : 'inherit', fontWeight: r.h >= 3 ? 'bold' : 'normal' }}>{r.h}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.dobl}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1, color: r.hr > 0 ? 'error.main' : 'inherit', fontWeight: r.hr > 0 ? 'bold' : 'normal' }}>{r.hr}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.rbi}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.r}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.bb}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.so}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.sb}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{fmtStat(r.ba)}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{calcObp(r)}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{calcSlg(r)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 12, py: 0.4, px: 1 }}>{calcOps(r)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

function PitcherTable({ rows }: { rows: PitcherRecord[] }) {
  if (rows.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>기록 없음</Typography>
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 440 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            {['선수', '역할', '이닝', '피안타', '자책', '볼넷', '삼진', '승', '패', 'SV', 'HLD', 'ERA'].map((h) => (
              <TableCell key={h} align={h === '선수' || h === '역할' ? 'left' : 'right'} sx={{ fontWeight: 'bold', fontSize: 11, py: 0.5, px: 1 }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.plrId} hover>
              <TableCell sx={{ fontWeight: r.w > 0 || r.sv > 0 ? 'bold' : 'normal', fontSize: 12, py: 0.4, px: 1 }}>{r.plrNm}</TableCell>
              <TableCell sx={{ fontSize: 12, py: 0.4, px: 1 }}>
                <Chip
                  label={ROLE_LABEL[r.ptchRoleCd] ?? r.ptchRoleCd}
                  size="small"
                  sx={{
                    height: 18, fontSize: 10,
                    bgcolor: r.ptchRoleCd === 'SP' ? '#dbeafe' : r.ptchRoleCd === 'CP' ? '#fce7f3' : '#f0fdf4',
                    color:   r.ptchRoleCd === 'SP' ? '#1e40af' : r.ptchRoleCd === 'CP' ? '#9d174d' : '#166534',
                  }}
                />
              </TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{fmtIp(r.ipOut)}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.h}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1, color: r.er >= 3 ? 'error.main' : 'inherit' }}>{r.er}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.bb}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.so}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1, color: r.w > 0 ? 'success.main' : 'inherit', fontWeight: r.w > 0 ? 'bold' : 'normal' }}>{r.w}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1, color: r.l > 0 ? 'error.main' : 'inherit' }}>{r.l}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1, color: r.sv > 0 ? 'primary.main' : 'inherit', fontWeight: r.sv > 0 ? 'bold' : 'normal' }}>{r.sv}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{r.hld}</TableCell>
              <TableCell align="right" sx={{ fontSize: 12, py: 0.4, px: 1 }}>{fmtStat(r.era, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
