import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, Grid, Paper, Divider,
  CircularProgress, Button, Stack, Tabs, Tab,
} from '@mui/material'
import { Link as RouterLinkBtn } from 'react-router-dom'
import { useState } from 'react'
import { useRosterPage } from './RosterPageHooks'
import type { RosterPlayer } from '../../api/rosterApi'
import RosterStatsPanel from '../../components/RosterStatsPanel'
import { CURRENT_SEASON_YEAR } from '../../constants'

// 포지션 코드 → 약칭 (PLR_POSN.POSN_CD 기준)
const POSN_SHORT: Record<string, string> = {
  '10': '선발', '11': '계투', '12': '마무리',
  '20': '포수', '21': '1루', '22': '2루', '23': '3루',
  '24': '유격', '25': '좌익', '26': '중견', '27': '우익', '28': 'DH',
}

export default function RosterPage() {
  const [pageTab, setPageTab] = useState(0)
  const {
    isLoading, tmId,
    firstTeamPlayers, secondTeamPlayers,
    firstPitchers, firstFielders,
    secondPitchers, secondFielders,
  } = useRosterPage()

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flex: 1 }}>구단 로스터</Typography>
        <Button
          component={RouterLinkBtn}
          to="/roster-confirm"
          variant="contained"
          size="small"
        >
          로스터 확정
        </Button>
      </Stack>

      <Tabs value={pageTab} onChange={(_, v) => setPageTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="로스터" sx={{ fontSize: 13 }} />
        <Tab label="기록" sx={{ fontSize: 13 }} />
      </Tabs>

      {pageTab === 1 && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <RosterStatsPanel tmId={tmId} ssntYr={CURRENT_SEASON_YEAR} />
        </Paper>
      )}

      {pageTab === 0 && isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : pageTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              1군 엔트리 ({firstTeamPlayers.length}명)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <PitcherSection title={`투수진 (${firstPitchers.length}명)`} players={firstPitchers} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <FielderSection title={`야수진 (${firstFielders.length}명)`} players={firstFielders} />
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              2군 ({secondTeamPlayers.length}명)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <PitcherSection title={`투수진 (${secondPitchers.length}명)`} players={secondPitchers} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <FielderSection title={`야수진 (${secondFielders.length}명)`} players={secondFielders} />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}
    </Box>
  )
}

// ============================================================
// 공통 유틸
// ============================================================

function statColor(value: number): string {
  if (value >= 70) return '#EAB308'
  if (value >= 60) return '#22C55E'
  if (value >= 50) return '#3B82F6'
  if (value >= 40) return '#A855F7'
  return '#9CA3AF'
}

function condColor(value: number): string {
  if (value >= 80) return '#22C55E'
  if (value >= 60) return '#3B82F6'
  if (value >= 40) return '#F59E0B'
  return '#EF4444'
}

function StatCell({ value, width = 28 }: { value: number | null; width?: number }) {
  if (value == null) return (
    <Typography variant="caption" sx={{ width, textAlign: 'center', color: 'text.disabled', fontSize: 11 }}>-</Typography>
  )
  return (
    <Typography variant="caption" sx={{ width, textAlign: 'center', fontSize: 11, fontWeight: value >= 50 ? 'bold' : 'normal', color: statColor(value) }}>
      {value}
    </Typography>
  )
}

function FatigCell({ value }: { value: number | null }) {
  if (value == null) return (
    <Typography variant="caption" sx={{ width: 28, textAlign: 'center', color: 'text.disabled', fontSize: 10 }}>-</Typography>
  )
  const color = value >= 80 ? '#EF4444' : value >= 60 ? '#F59E0B' : '#22C55E'
  return (
    <Typography variant="caption" sx={{ width: 28, textAlign: 'center', fontSize: 10, color }}>
      {value}
    </Typography>
  )
}

function CondCell({ value }: { value: number | null }) {
  if (value == null) return (
    <Typography variant="caption" sx={{ width: 28, textAlign: 'center', color: 'text.disabled', fontSize: 10 }}>-</Typography>
  )
  return (
    <Typography variant="caption" sx={{ width: 28, textAlign: 'center', fontSize: 10, color: condColor(value) }}>
      {value}
    </Typography>
  )
}

function PosnCell({ posnCd }: { posnCd: string | null }) {
  const label = posnCd ? (POSN_SHORT[posnCd] ?? posnCd) : '-'
  return (
    <Typography variant="caption" sx={{ width: 36, flexShrink: 0, fontSize: 10, color: 'text.secondary', textAlign: 'center' }}>
      {label}
    </Typography>
  )
}

// ============================================================
// 투수 섹션 (구속·제구·변화·스태미나·피로·컨디션)
// ============================================================

function PitcherSection({ title, players }: { title: string; players: RosterPlayer[] }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.75, color: 'text.secondary' }}>
        {title}
      </Typography>
      {players.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>선수 없음</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 0.5, mb: 0.25, gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', width: 36, textAlign: 'center', fontSize: 10 }}>포지션</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', flex: '1 1 0', minWidth: 0, fontSize: 10 }}>이름</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {['OVR', '구속', '제구', '변화', '스태', '피로', '컨디'].map((h) => (
                <Typography key={h} variant="caption" sx={{ color: 'text.secondary', width: 28, textAlign: 'center', fontSize: 10 }}>{h}</Typography>
              ))}
            </Box>
          </Box>
          {players.map((p) => (
            <Box
              key={p.plrId}
              sx={{ display: 'flex', alignItems: 'center', py: 0.4, px: 0.5, gap: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <PosnCell posnCd={p.posnCd} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
                <RouterLink
                  to={`/players/${p.plrId}`}
                  style={{
                    fontWeight: 'bold', color: 'inherit', textDecoration: 'none',
                    fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {p.plrNm}
                </RouterLink>
                {p.plrFrgnYn === '1' && (
                  <Typography component="span" variant="caption" sx={{ color: 'text.secondary', flexShrink: 0, fontSize: 10 }}>(외)</Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <StatCell value={p.plrOvrlAblt} />
                <StatCell value={p.vel} />
                <StatCell value={p.ctl} />
                <StatCell value={p.brk} />
                <StatCell value={p.stm} />
                <FatigCell value={p.fatg} />
                <CondCell value={p.cond} />
              </Box>
            </Box>
          ))}
        </>
      )}
    </Box>
  )
}

// ============================================================
// 야수 섹션 (컨택·파워·주루·송구·도루·피로·컨디션)
// ============================================================

function FielderSection({ title, players }: { title: string; players: RosterPlayer[] }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.75, color: 'text.secondary' }}>
        {title}
      </Typography>
      {players.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>선수 없음</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 0.5, mb: 0.25, gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', width: 36, textAlign: 'center', fontSize: 10 }}>포지션</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', flex: '1 1 0', minWidth: 0, fontSize: 10 }}>이름</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {['OVR', '컨택', '파워', '주루', '송구', '도루', '피로', '컨디'].map((h) => (
                <Typography key={h} variant="caption" sx={{ color: 'text.secondary', width: 28, textAlign: 'center', fontSize: 10 }}>{h}</Typography>
              ))}
            </Box>
          </Box>
          {players.map((p) => (
            <Box
              key={p.plrId}
              sx={{ display: 'flex', alignItems: 'center', py: 0.4, px: 0.5, gap: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <PosnCell posnCd={p.posnCd} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
                <RouterLink
                  to={`/players/${p.plrId}`}
                  style={{
                    fontWeight: 'bold', color: 'inherit', textDecoration: 'none',
                    fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {p.plrNm}
                </RouterLink>
                {p.plrFrgnYn === '1' && (
                  <Typography component="span" variant="caption" sx={{ color: 'text.secondary', flexShrink: 0, fontSize: 10 }}>(외)</Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <StatCell value={p.plrOvrlAblt} />
                <StatCell value={p.cnt} />
                <StatCell value={p.pwr} />
                <StatCell value={p.run} />
                <StatCell value={p.thr} />
                <StatCell value={p.stl} />
                <FatigCell value={p.fatg} />
                <CondCell value={p.cond} />
              </Box>
            </Box>
          ))}
        </>
      )}
    </Box>
  )
}
