import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  Tabs, Tab, CircularProgress, Chip, Divider, Paper,
} from '@mui/material'
import SportsCricketIcon from '@mui/icons-material/SportsCricket'
import { useGames } from '../hooks/useGames'
import { useGameRecords } from '../hooks/useGames'
import type { BatterRecord, PitcherRecord } from '../types/game'
import { useTeamMeta } from '../hooks/useTeamMeta'

interface Props {
  open: boolean
  onClose: () => void
  ssntYr: number
  gameDt: string
  userTmId: number | null
}

function fmtIp(ipOut: number): string {
  return `${Math.floor(ipOut / 3)}.${ipOut % 3}`
}

function fmtStat(v: number | null | undefined, decimals = 3): string {
  if (v == null) return '-'
  return v.toFixed(decimals).replace(/^0/, '')
}

function calcOps(r: BatterRecord): string {
  const obpNum = r.ab + r.bb + r.hbp + r.sf
  const obp = obpNum > 0 ? (r.h + r.bb + r.hbp) / obpNum : 0
  const singles = r.h - r.dobl - r.trpl - r.hr
  const totalBases = singles + r.dobl * 2 + r.trpl * 3 + r.hr * 4
  const slg = r.ab > 0 ? totalBases / r.ab : 0
  return (obp + slg).toFixed(3).replace(/^0/, '')
}

function calcObp(r: BatterRecord): string {
  const denom = r.ab + r.bb + r.hbp + r.sf
  return denom > 0 ? ((r.h + r.bb + r.hbp) / denom).toFixed(3).replace(/^0/, '') : '-'
}

function calcSlg(r: BatterRecord): string {
  if (r.ab === 0) return '-'
  const singles = r.h - r.dobl - r.trpl - r.hr
  const tb = singles + r.dobl * 2 + r.trpl * 3 + r.hr * 4
  return (tb / r.ab).toFixed(3).replace(/^0/, '')
}

export default function GameResultsDialog({ open, onClose, ssntYr, gameDt, userTmId }: Props) {
  const { data: games = [], isLoading: gamesLoading } = useGames(
    open ? { ssntYr, gameDt } : undefined
  )

  const userGame = games.find(
    (g) => g.homeTmId === userTmId || g.awayTmId === userTmId
  )
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [tab, setTab] = useState(0)

  const activeGameId = selectedGameId ?? userGame?.gameId ?? (games[0]?.gameId ?? null)
  const { data: records, isLoading: recLoading } = useGameRecords(activeGameId)

  const { getByTmId, getEmblemPath, getCiClr } = useTeamMeta()

  const completedGames = games.filter((g) => g.gameSttsCd === '03')

  const batters = records?.batters ?? []
  const pitchers = records?.pitchers ?? []

  const activeGame = games.find((g) => g.gameId === activeGameId)
  const homeBatters = batters.filter((r) => r.tmId === activeGame?.homeTmId)
  const awayBatters = batters.filter((r) => r.tmId === activeGame?.awayTmId)
  const homePitchers = pitchers.filter((r) => r.tmId === activeGame?.homeTmId)
  const awayPitchers = pitchers.filter((r) => r.tmId === activeGame?.awayTmId)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SportsCricketIcon fontSize="small" />
        {gameDt} 경기 결과
      </DialogTitle>
      <DialogContent dividers>
        {gamesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : completedGames.length === 0 ? (
          <Typography variant="body2" color="text.secondary">완료된 경기가 없습니다.</Typography>
        ) : (
          <>
            {/* 스코어보드 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              {completedGames.map((g) => {
                const isActive = g.gameId === activeGameId
                const isUserGame = g.homeTmId === userTmId || g.awayTmId === userTmId
                const homeWon = (g.homeScore ?? 0) > (g.awayScore ?? 0)
                const awayWon = (g.awayScore ?? 0) > (g.homeScore ?? 0)
                const homeMeta = getByTmId(g.homeTmId)
                const awayMeta = getByTmId(g.awayTmId)
                const homeCi = getCiClr(homeMeta?.tmShrtEngNm)
                const awayCi = getCiClr(awayMeta?.tmShrtEngNm)
                const homeEmb = getEmblemPath(homeMeta?.tmShrtEngNm)
                const awayEmb = getEmblemPath(awayMeta?.tmShrtEngNm)
                return (
                  <Paper
                    key={g.gameId}
                    variant="outlined"
                    onClick={() => setSelectedGameId(g.gameId)}
                    sx={{
                      p: 1.5, cursor: 'pointer', minWidth: 200,
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
                        {homeEmb && <Box component="img" src={homeEmb} sx={{ width: 20, height: 20, objectFit: 'contain' }} />}
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: homeWon ? 'bold' : 'normal', color: homeCi ?? 'text.primary' }}
                        >
                          {g.homeTmKrNm}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mx: 1 }}>
                        <span style={{ color: homeWon ? '#1976d2' : 'inherit' }}>{g.homeScore ?? 0}</span>
                        {' : '}
                        <span style={{ color: awayWon ? '#1976d2' : 'inherit' }}>{g.awayScore ?? 0}</span>
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: awayWon ? 'bold' : 'normal', color: awayCi ?? 'text.primary' }}
                        >
                          {g.awayTmKrNm}
                        </Typography>
                        {awayEmb && <Box component="img" src={awayEmb} sx={{ width: 20, height: 20, objectFit: 'contain' }} />}
                      </Box>
                    </Box>
                  </Paper>
                )
              })}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* 선수 기록 */}
            {activeGame && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {activeGame.homeTmKrNm} {activeGame.homeScore} : {activeGame.awayScore} {activeGame.awayTmKrNm} — 선수 기록
                </Typography>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Tab label="타자 기록" />
                  <Tab label="투수 기록" />
                </Tabs>

                {recLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : tab === 0 ? (
                  <Box>
                    {[
                      { label: activeGame.homeTmKrNm, rows: homeBatters },
                      { label: activeGame.awayTmKrNm, rows: awayBatters },
                    ].map(({ label, rows }) => (
                      <Box key={label} sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'block' }}>
                          {label}
                        </Typography>
                        <BatterTable rows={rows} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box>
                    {[
                      { label: activeGame.homeTmKrNm, rows: homePitchers },
                      { label: activeGame.awayTmKrNm, rows: awayPitchers },
                    ].map(({ label, rows }) => (
                      <Box key={label} sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 0.5, display: 'block' }}>
                          {label}
                        </Typography>
                        <PitcherTable rows={rows} />
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  )
}

function BatterTable({ rows }: { rows: BatterRecord[] }) {
  if (rows.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>기록 없음</Typography>
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 520 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>선수</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>타석</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>타수</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>안타</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>2루타</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>홈런</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>타점</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>득점</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>볼넷</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>삼진</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>도루</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>타율</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>출루율</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>장타율</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>OPS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.plrId} hover>
              <TableCell sx={{ fontWeight: r.hr > 0 || r.h >= 3 ? 'bold' : 'normal' }}>{r.plrNm}</TableCell>
              <TableCell align="right">{r.pa}</TableCell>
              <TableCell align="right">{r.ab}</TableCell>
              <TableCell align="right" sx={{ color: r.h >= 3 ? 'success.main' : 'inherit' }}>{r.h}</TableCell>
              <TableCell align="right">{r.dobl}</TableCell>
              <TableCell align="right" sx={{ color: r.hr > 0 ? 'error.main' : 'inherit', fontWeight: r.hr > 0 ? 'bold' : 'normal' }}>{r.hr}</TableCell>
              <TableCell align="right">{r.rbi}</TableCell>
              <TableCell align="right">{r.r}</TableCell>
              <TableCell align="right">{r.bb}</TableCell>
              <TableCell align="right">{r.so}</TableCell>
              <TableCell align="right">{r.sb}</TableCell>
              <TableCell align="right">{fmtStat(r.ba)}</TableCell>
              <TableCell align="right">{calcObp(r)}</TableCell>
              <TableCell align="right">{calcSlg(r)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{calcOps(r)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

const ROLE_LABEL: Record<string, string> = { SP: '선발', RP: '중계', CP: '마무리' }

function PitcherTable({ rows }: { rows: PitcherRecord[] }) {
  if (rows.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>기록 없음</Typography>
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 480 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>선수</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>역할</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>이닝</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>피안타</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>자책</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>볼넷</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>삼진</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>승</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>패</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>세이브</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>홀드</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>ERA</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.plrId} hover>
              <TableCell sx={{ fontWeight: r.w > 0 || r.sv > 0 ? 'bold' : 'normal' }}>{r.plrNm}</TableCell>
              <TableCell>
                <Chip
                  label={ROLE_LABEL[r.ptchRoleCd] ?? r.ptchRoleCd}
                  size="small"
                  sx={{ height: 18, fontSize: 11,
                    bgcolor: r.ptchRoleCd === 'SP' ? '#dbeafe' : r.ptchRoleCd === 'CP' ? '#fce7f3' : '#f0fdf4',
                    color: r.ptchRoleCd === 'SP' ? '#1e40af' : r.ptchRoleCd === 'CP' ? '#9d174d' : '#166534',
                  }}
                />
              </TableCell>
              <TableCell align="right">{fmtIp(r.ipOut)}</TableCell>
              <TableCell align="right">{r.h}</TableCell>
              <TableCell align="right" sx={{ color: r.er >= 3 ? 'error.main' : 'inherit' }}>{r.er}</TableCell>
              <TableCell align="right">{r.bb}</TableCell>
              <TableCell align="right">{r.so}</TableCell>
              <TableCell align="right" sx={{ color: r.w > 0 ? 'success.main' : 'inherit', fontWeight: r.w > 0 ? 'bold' : 'normal' }}>{r.w}</TableCell>
              <TableCell align="right" sx={{ color: r.l > 0 ? 'error.main' : 'inherit' }}>{r.l}</TableCell>
              <TableCell align="right" sx={{ color: r.sv > 0 ? 'primary.main' : 'inherit', fontWeight: r.sv > 0 ? 'bold' : 'normal' }}>{r.sv}</TableCell>
              <TableCell align="right">{r.hld}</TableCell>
              <TableCell align="right">{fmtStat(r.era, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
