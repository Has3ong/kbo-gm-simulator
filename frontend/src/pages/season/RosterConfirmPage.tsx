import {
  Box, Typography, AppBar, Toolbar, Button, Chip, Paper,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Alert, CircularProgress, Select, MenuItem, Divider, Stack, Tabs, Tab,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PeopleIcon from '@mui/icons-material/People'
import { Link as RouterLink } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RosterStatsPanel from '../../components/RosterStatsPanel'
import { useGame } from '../../contexts/GameContext'
import { CURRENT_SEASON_YEAR } from '../../constants'
import {
  useRosterConfirmPage, POSN_OPTIONS, BULL_ROLE_OPTIONS, getBullRoleLabel,
} from './RosterConfirmPageHooks'
import { ABILITY_GRADE_COLOR } from '../../constants'
import type { RosterPlayer } from '../../types/roster'

// PLR_POSN.POSN_CD 기반 약칭 (10=선발투수 … 28=DH)
const POSN_SHORT: Record<string, string> = {
  '10': '선발', '11': '계투', '12': '마무리',
  '20': '포수', '21': '1루', '22': '2루', '23': '3루',
  '24': '유격', '25': '좌익', '26': '중견', '27': '우익', '28': 'DH',
}

// ============================================================
// 유틸
// ============================================================

function gradeColor(val: number | null | undefined): string {
  if (val == null) return '#9CA3AF'
  if (val >= 70) return ABILITY_GRADE_COLOR['S'] ?? '#EAB308'
  if (val >= 60) return ABILITY_GRADE_COLOR['A'] ?? '#22C55E'
  if (val >= 50) return ABILITY_GRADE_COLOR['B'] ?? '#3B82F6'
  if (val >= 40) return ABILITY_GRADE_COLOR['C'] ?? '#A855F7'
  return ABILITY_GRADE_COLOR['D'] ?? '#9CA3AF'
}

function OvrBadge({ val }: { val: number | null | undefined }) {
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 'bold', fontSize: 13, color: gradeColor(val),
        minWidth: 24, textAlign: 'center',
      }}
    >
      {val ?? '-'}
    </Typography>
  )
}

function GradeChip({ val, label }: { val: number | null | undefined; label?: string }) {
  return (
    <Chip
      label={label ? `${label} ${val ?? '-'}` : (val ?? '-')}
      size="small"
      sx={{
        bgcolor: gradeColor(val), color: 'white', fontWeight: 'bold',
        fontSize: 10, height: 18, '& .MuiChip-label': { px: 0.5 },
      }}
    />
  )
}

function AbilityCell({ ablts, isPitcher }: { ablts: Record<string, number>; isPitcher: boolean }) {
  const entries = isPitcher
    ? [['구속', ablts['VEL']], ['제구', ablts['CTL']], ['변화', ablts['BRK']], ['스태', ablts['STM']]]
    : [['컨택', ablts['CNT']], ['파워', ablts['PWR']], ['주루', ablts['RUN']]]
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {entries.map(([label, v]) => (
        <Box key={String(label)} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25 }}>
          <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1 }}>
            {label}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 'bold', fontSize: 13, color: v != null ? gradeColor(v as number) : 'text.disabled', lineHeight: 1 }}
          >
            {v ?? '-'}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ============================================================
// 선수 테이블
// ============================================================

function sortPlayers(players: RosterPlayer[]): RosterPlayer[] {
  return [...players].sort((a, b) => {
    const aP = a.REPR_POSN_CD === '10'
    const bP = b.REPR_POSN_CD === '10'
    if (aP !== bP) return aP ? -1 : 1
    const posA = Number(a.REPR_POSN_CD)
    const posB = Number(b.REPR_POSN_CD)
    if (posA !== posB) return posA - posB
    return (b.PLR_OVRL_ABLT ?? 0) - (a.PLR_OVRL_ABLT ?? 0)
  })
}

interface PlayerTableProps {
  players: RosterPlayer[]
  isFirst: boolean
  dragPlrId: number | null
  onDragStart: (plrId: number) => void
  onToggle: (plrId: number) => void
}

function PlayerTable({ players, isFirst, dragPlrId, onDragStart, onToggle }: PlayerTableProps) {
  if (players.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', py: 1, px: 0.5 }}>
        {isFirst ? '선수 없음 — 2군에서 클릭 또는 드래그하여 이동' : '2군 선수 없음'}
      </Typography>
    )
  }

  return (
    <TableContainer>
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow sx={{ bgcolor: isFirst ? 'primary.50' : 'grey.100' }}>
            <TableCell sx={{ width: 84, fontSize: 12, fontWeight: 'bold', py: 0.5 }}>포지션</TableCell>
            <TableCell sx={{ width: 90, fontSize: 12, fontWeight: 'bold', py: 0.5 }}>이름</TableCell>
            <TableCell sx={{ width: 36, fontSize: 12, fontWeight: 'bold', py: 0.5, textAlign: 'center' }}>OVR</TableCell>
            <TableCell sx={{ width: 36, fontSize: 12, fontWeight: 'bold', py: 0.5, textAlign: 'center' }}>POT</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 'bold', py: 0.5 }}>능력치</TableCell>
            <TableCell sx={{ width: 24, py: 0.5 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortPlayers(players).map((p) => {
            const isPitcher = p.REPR_POSN_CD === '10'
            const ablts = (p.ABLTS as Record<string, number>) ?? {}
            const isDragging = dragPlrId === p.PLR_ID
            return (
              <TableRow
                key={p.PLR_ID}
                draggable
                onDragStart={() => onDragStart(p.PLR_ID)}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => onToggle(p.PLR_ID)}
                hover
                sx={{
                  cursor: 'grab',
                  userSelect: 'none',
                  bgcolor: isDragging ? 'action.selected' : 'inherit',
                  '& td': { py: 0.4 },
                }}
              >
                <TableCell>
                  <Chip
                    label={POSN_SHORT[p['POSN_CD'] as string] ?? (p['POSN_CD'] as string) ?? '-'}
                    size="small"
                    variant="outlined"
                    color={isPitcher ? 'secondary' : 'default'}
                    sx={{ fontSize: 13, height: 26, '& .MuiChip-label': { px: 1 } }}
                  />
                </TableCell>
                <TableCell>
                  <RouterLink
                    to={`/players/${p.PLR_ID}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: 12, fontWeight: 'bold', color: 'inherit', textDecoration: 'none',
                      display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {p.PLR_NM}
                  </RouterLink>
                </TableCell>
                <TableCell align="center"><OvrBadge val={p.PLR_OVRL_ABLT} /></TableCell>
                <TableCell align="center">
                  <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {p.PLR_POT_ABLT ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell><AbilityCell ablts={ablts} isPitcher={isPitcher} /></TableCell>
                <TableCell align="center">
                  {p.PLR_FRGN_YN === '1' && (
                    <Chip label="외" size="small" color="warning"
                      sx={{ fontSize: 9, height: 14, '& .MuiChip-label': { px: 0.3 } }} />
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// ============================================================
// 메인 페이지
// ============================================================

export default function RosterConfirmPage() {
  const navigate = useNavigate()
  const [rightTab, setRightTab] = useState(0)
  const [filterType, setFilterType] = useState<'ALL' | 'P' | 'B'>('ALL')
  const [leftMode, setLeftMode] = useState<'roster' | 'stats'>('roster')
  const { currentGame } = useGame()
  const userTmId = currentGame?.userTeamId ?? undefined

  const {
    isLoading, isError, allPlayers,
    firstTeamIds, toggleFirstTeam,
    handleDropIntoFirst, handleDropIntoSecond,
    battingOrder, handleDragStart, handleDropOnBattingSlot, removeFromBattingOrder,
    setSlotPosn, backupBatters, battingOrderPlrIds, posnToSlot,
    rotation, rotationPlrIds,
    handleRotationSlotDragStart, handleDropOnRotationSlot, removeFromRotation,
    bullpenPitchers, bullpenRoles, setBullpenRole,
    firstTeamPitchers, firstTeamBatters,
    dragPlrId, dragRotationIdx,
    firstTeamCount, frgnCount, validationErrors, canConfirm,
    handleConfirm, confirmMutation,
    autoAssignRoster,
  } = useRosterConfirmPage()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">로스터 데이터를 불러오지 못했습니다.</Alert>
      </Box>
    )
  }

  const firstTeamPlayers = allPlayers.filter((p) => firstTeamIds.has(p.PLR_ID))
  const secondTeamPlayers = allPlayers.filter((p) => !firstTeamIds.has(p.PLR_ID))

  const applyFilter = (list: RosterPlayer[]) =>
    filterType === 'P' ? list.filter((p) => p.REPR_POSN_CD === '10')
    : filterType === 'B' ? list.filter((p) => p.REPR_POSN_CD !== '10')
    : list

  const filteredFirst  = applyFilter(firstTeamPlayers)
  const filteredSecond = applyFilter(secondTeamPlayers)

  const isDraggingAny = dragPlrId !== null || dragRotationIdx !== null

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1.5 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/season')} size="small">
            시즌으로
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>로스터 확정</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AutoFixHighIcon />}
              onClick={autoAssignRoster}
            >
              자동 배정
            </Button>
            <Chip
              label={`1군 ${firstTeamCount}명`}
              color={firstTeamCount < 20 || firstTeamCount > 29 ? 'error' : 'success'}
              size="small"
            />
            <Chip label={`외국인 ${frgnCount}/3`} color={frgnCount > 3 ? 'error' : 'default'} size="small" />
            {validationErrors.map((msg, i) => (
              <Alert key={i} severity="error" sx={{ py: 0, px: 1, fontSize: 12 }}>{msg}</Alert>
            ))}
            {confirmMutation.isError && (
              <Alert severity="error" sx={{ py: 0, px: 1, fontSize: 12 }}>
                {(confirmMutation.error as Error)?.message ?? '확정 실패'}
              </Alert>
            )}
            <Button variant="contained" color="primary" disabled={!canConfirm} onClick={handleConfirm}>
              로스터 확정
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
        {/* 왼쪽: 1군/2군 테이블 or 기록 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 상단 모드 전환 + 필터 */}
          <Box sx={{
            px: 2, py: 0.75, bgcolor: 'background.paper',
            borderBottom: 1, borderColor: 'divider',
            display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <ToggleButtonGroup
              value={leftMode}
              exclusive
              onChange={(_, v) => v && setLeftMode(v)}
              size="small"
              sx={{ mr: 1 }}
            >
              <ToggleButton value="roster" sx={{ px: 1.5, py: 0.25, fontSize: 11 }}>
                <PeopleIcon sx={{ fontSize: 14, mr: 0.5 }} />로스터
              </ToggleButton>
              <ToggleButton value="stats" sx={{ px: 1.5, py: 0.25, fontSize: 11 }}>
                <AssessmentIcon sx={{ fontSize: 14, mr: 0.5 }} />기록
              </ToggleButton>
            </ToggleButtonGroup>

            {leftMode === 'roster' && (
              <>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>필터:</Typography>
                {(['ALL', 'P', 'B'] as const).map((f) => (
                  <Chip
                    key={f}
                    label={f === 'ALL' ? '전체' : f === 'P' ? '투수' : '야수'}
                    size="small"
                    variant={filterType === f ? 'filled' : 'outlined'}
                    color={filterType === f ? 'primary' : 'default'}
                    onClick={() => setFilterType(f)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                  행 클릭 또는 드래그로 1군 ↔ 2군 이동
                </Typography>
              </>
            )}
          </Box>

          {/* 기록 모드 */}
          {leftMode === 'stats' && (
            <Box sx={{ flex: 1, overflow: 'auto', p: 1.5, bgcolor: 'background.paper' }}>
              <RosterStatsPanel tmId={userTmId} ssntYr={CURRENT_SEASON_YEAR} />
            </Box>
          )}

          {/* 1군 + 2군 (로스터 모드) */}
          {leftMode === 'roster' && (
            <>
              <Box
                sx={{ flex: 1, overflow: 'auto', p: 1.5, bgcolor: 'background.paper' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropIntoFirst}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    1군 엔트리
                  </Typography>
                  <Chip label={`${filteredFirst.length}명`} size="small" color="primary" variant="outlined" />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>최소 20명 / 최대 29명</Typography>
                  {isDraggingAny && (
                    <Chip label="여기로 드랍 → 1군" size="small" color="primary" sx={{ animation: 'none' }} />
                  )}
                </Box>
                <PlayerTable
                  players={filteredFirst}
                  isFirst
                  dragPlrId={dragPlrId}
                  onDragStart={handleDragStart}
                  onToggle={toggleFirstTeam}
                />
              </Box>

              <Divider />

              <Box
                sx={{ flex: 1, overflow: 'auto', p: 1.5, bgcolor: 'grey.50' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropIntoSecond}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    2군
                  </Typography>
                  <Chip label={`${filteredSecond.length}명`} size="small" variant="outlined" />
                  {isDraggingAny && (
                    <Chip label="여기로 드랍 → 2군" size="small" variant="outlined" />
                  )}
                </Box>
                <PlayerTable
                  players={filteredSecond}
                  isFirst={false}
                  dragPlrId={dragPlrId}
                  onDragStart={handleDragStart}
                  onToggle={toggleFirstTeam}
                />
              </Box>
            </>
          )}
        </Box>

        {/* 오른쪽: 타순/로테이션/불펜 */}
        <Paper square elevation={2} sx={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Tabs value={rightTab} onChange={(_, v) => setRightTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="타순" sx={{ fontSize: 12 }} />
            <Tab label="선발 로테이션" sx={{ fontSize: 12 }} />
            <Tab label="불펜" sx={{ fontSize: 12 }} />
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
            {/* 타순 탭 */}
            {rightTab === 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  1군 야수를 드래그하여 타순 슬롯에 놓으세요.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slot) => {
                    const entry = battingOrder[slot]
                    const plr = entry ? allPlayers.find((p) => p.PLR_ID === entry.plrId) : null
                    return (
                      <Box
                        key={slot}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnBattingSlot(slot)}
                        sx={{
                          display: 'flex', gap: 1, alignItems: 'center',
                          p: 0.75, border: '2px dashed', borderColor: 'divider',
                          borderRadius: 1, minHeight: 40,
                          bgcolor: dragPlrId ? 'action.hover' : 'background.paper',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'bold', width: 48, flexShrink: 0 }}>
                          {slot}번 타자
                        </Typography>
                        {plr ? (
                          <>
                            <Chip
                              label={`${plr.PLR_NM} (${plr.PLR_OVRL_ABLT})`}
                              size="small"
                              onDelete={() => removeFromBattingOrder(slot)}
                              sx={{ maxWidth: 130 }}
                            />
                            <Select
                              size="small"
                              value={entry?.posnCd ?? '9'}
                              onChange={(e) => setSlotPosn(slot, e.target.value)}
                              sx={{ fontSize: 11, height: 26, minWidth: 80 }}
                            >
                              {POSN_OPTIONS.map((opt) => {
                                const takenByOtherSlot =
                                  posnToSlot[opt.code] !== undefined &&
                                  posnToSlot[opt.code] !== slot
                                return (
                                  <MenuItem
                                    key={opt.code}
                                    value={opt.code}
                                    disabled={takenByOtherSlot}
                                    sx={{ fontSize: 12 }}
                                  >
                                    {takenByOtherSlot ? `${opt.label} (사용 중)` : opt.label}
                                  </MenuItem>
                                )
                              })}
                            </Select>
                          </>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>비어 있음</Typography>
                        )}
                      </Box>
                    )
                  })}
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  1군 야수 (드래그 가능)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {firstTeamBatters.map((p) => (
                    <Chip
                      key={p.PLR_ID}
                      label={`${p.PLR_NM} (${p.PLR_OVRL_ABLT})`}
                      size="small"
                      draggable
                      onDragStart={() => handleDragStart(p.PLR_ID)}
                      color={battingOrderPlrIds.has(p.PLR_ID) ? 'primary' : 'default'}
                      variant={battingOrderPlrIds.has(p.PLR_ID) ? 'filled' : 'outlined'}
                      sx={{ cursor: 'grab' }}
                    />
                  ))}
                </Box>
                {backupBatters.length > 0 && (
                  <>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, mb: 0.5 }}>
                      백업 야수
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {backupBatters.map((p) => (
                        <Chip
                          key={p.PLR_ID}
                          label={`${p.PLR_NM} (${p.PLR_OVRL_ABLT})`}
                          size="small"
                          variant="outlined"
                          draggable
                          onDragStart={() => handleDragStart(p.PLR_ID)}
                          sx={{ cursor: 'grab' }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* 선발 로테이션 탭 */}
            {rightTab === 1 && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  투수를 드래그하여 선발 순서를 지정하세요. 슬롯 간 드래그로 순서 조정 가능.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const plrId = rotation[idx]
                    const plr = plrId ? allPlayers.find((p) => p.PLR_ID === plrId) : null
                    const isDraggingThisSlot = dragRotationIdx === idx
                    return (
                      <Box
                        key={idx}
                        draggable={plrId !== null}
                        onDragStart={() => handleRotationSlotDragStart(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnRotationSlot(idx)}
                        sx={{
                          display: 'flex', gap: 1, alignItems: 'center',
                          p: 0.75, border: '2px dashed',
                          borderColor: isDraggingThisSlot ? 'primary.main'
                            : (dragPlrId || dragRotationIdx !== null) ? 'primary.light'
                            : 'divider',
                          borderRadius: 1, minHeight: 40,
                          cursor: plrId ? 'grab' : 'default',
                          bgcolor: isDraggingThisSlot ? 'action.selected'
                            : (dragPlrId || dragRotationIdx !== null) ? 'action.hover'
                            : 'background.paper',
                          transition: 'border-color 0.15s, background-color 0.15s',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'bold', width: 44, flexShrink: 0 }}>
                          {idx + 1}선발
                        </Typography>
                        {plr ? (
                          <>
                            <Chip
                              label={`${plr.PLR_NM} (${plr.PLR_OVRL_ABLT})`}
                              size="small"
                              onDelete={() => removeFromRotation(idx)}
                              onClick={(e) => e.stopPropagation()}
                              sx={{ maxWidth: 150, cursor: 'grab' }}
                            />
                            <GradeChip val={plr.PLR_OVRL_ABLT as number} label="OVR" />
                          </>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>비어 있음</Typography>
                        )}
                      </Box>
                    )
                  })}
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  1군 투수 (드래그 가능)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {firstTeamPitchers.map((p) => (
                    <Chip
                      key={p.PLR_ID}
                      label={`${p.PLR_NM} (${p.PLR_OVRL_ABLT})`}
                      size="small"
                      draggable
                      onDragStart={() => handleDragStart(p.PLR_ID)}
                      color={rotationPlrIds.has(p.PLR_ID) ? 'primary' : 'default'}
                      variant={rotationPlrIds.has(p.PLR_ID) ? 'filled' : 'outlined'}
                      sx={{ cursor: 'grab' }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* 불펜 탭 */}
            {rightTab === 2 && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  불펜 투수 역할을 배정하세요. (기본: 중간계투)
                </Typography>
                {bullpenPitchers.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>불펜 투수 없음</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: 12 }}>이름</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: 12 }} align="right">OVR</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: 12 }}>역할</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bullpenPitchers.map((p) => (
                          <TableRow key={p.PLR_ID} hover>
                            <TableCell sx={{ fontSize: 12 }}>{p.PLR_NM}</TableCell>
                            <TableCell align="right" sx={{ fontSize: 12 }}>{p.PLR_OVRL_ABLT}</TableCell>
                            <TableCell>
                              <Select
                                size="small"
                                value={bullpenRoles[p.PLR_ID] ?? 'MR'}
                                onChange={(e) => setBullpenRole(p.PLR_ID, e.target.value)}
                                sx={{ minWidth: 100, fontSize: 12 }}
                              >
                                {BULL_ROLE_OPTIONS.map((opt) => (
                                  <MenuItem key={opt.code} value={opt.code} sx={{ fontSize: 12 }}>
                                    {getBullRoleLabel(opt.code)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
