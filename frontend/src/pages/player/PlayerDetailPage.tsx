import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, Grid, Paper, Divider, Chip, IconButton,
  Table, TableBody, TableHead, TableRow, TableCell,
  LinearProgress, CircularProgress, Tooltip, Tabs, Tab,
  Select, MenuItem, FormControl, InputLabel, ToggleButtonGroup, ToggleButton,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatSalary } from '../../utils/format'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { usePlayerDetailPage } from './PlayerDetailPageHooks'
import { useReleaseForeignPlayer } from '../../hooks/usePlayers'
import { useGame } from '../../contexts/GameContext'
import { fmtIp, fmtStat } from '../../types/player'
import type { PlrBatrSsntRec, PlrPtchSsntRec, PlrBatrMonRec, PlrPtchMonRec, PlrAbltSsnt, PlrAbltMon, PlrInjryHist } from '../../types/player'
import { useTeamMeta } from '../../hooks/useTeamMeta'
import PlrEditModal from '../../components/PlrEditModal'

export default function PlayerDetailPage() {
  const {
    player, abilities, positions, traits, hiddenAbilities, fatgCond, injuryHistory, contract,
    contractHistory, salaryHistory, abilityHistory, abilityMonthlyHistory,
    abilityViewMode, setAbilityViewMode, abilityChartYear, setAbilityChartYear, abilityYears,
    seasonStats, monthlyStats,
    isLoading, isPlrPitcher,
    tabIndex, setTabIndex, selectedYear, setSelectedYear, availableYears,
    PLR_STTS_LABEL, BAT_PTCH_HAND_LABEL, ABILITY_GRADE_COLOR,
  } = usePlayerDetailPage()

  const [editOpen, setEditOpen] = useState(false)
  const [releaseOpen, setReleaseOpen] = useState(false)
  const navigate = useNavigate()
  const { currentGame } = useGame()
  const releaseMutation = useReleaseForeignPlayer(player?.plrId ?? 0, () => {
    setReleaseOpen(false)
    navigate('/players')
  })
  const canRelease =
    !!player &&
    player.plrFrgnYn === '1' &&
    player.plrSttsCd === 'AT' &&
    !!currentGame &&
    player.tmId === currentGame.userTeamId

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (!player) return <Typography sx={{ color: 'error.main', mt: 2 }}>선수를 찾을 수 없습니다.</Typography>

  return (
    <Box>
      <RouterLink to="/players" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, color: 'inherit', textDecoration: 'none', fontSize: 14 }}>
        <ArrowBackIcon sx={{ fontSize: 16 }} /> 선수 목록
      </RouterLink>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{player.plrNm}</Typography>
        {player.plrFrgnYn === '1' && <Chip label="외국인" size="small" color="warning" />}
        <Tooltip title="선수 정보 수정" arrow>
          <IconButton size="small" onClick={() => setEditOpen(true)} sx={{ ml: 0.5 }}>
            <BuildIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {canRelease && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<PersonRemoveIcon fontSize="small" />}
            onClick={() => setReleaseOpen(true)}
            sx={{ ml: 1 }}
          >
            외국인 계약 해지
          </Button>
        )}
      </Box>
      {player.plrEngNm && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{player.plrEngNm}</Typography>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <InfoItem label="구단">
          {player.tmId
            ? <RouterLink to={`/teams/${player.tmId}`} style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'none' }}>{player.tmKrNm}</RouterLink>
            : <span style={{ fontWeight: 'bold' }}>FA</span>}
        </InfoItem>
        <InfoItem label="포지션"><span style={{ fontWeight: 'bold' }}>{player.reprPosnNm ?? '-'}</span></InfoItem>
        <InfoItem label="상태"><span style={{ fontWeight: 'bold' }}>{PLR_STTS_LABEL[player.plrSttsCd ?? ''] ?? '-'}</span></InfoItem>
        <InfoItem label="체격"><span style={{ fontWeight: 'bold' }}>{`${player.plrHgt ?? '-'}cm / ${player.plrWgt ?? '-'}kg`}</span></InfoItem>
        <InfoItem label="투타"><span style={{ fontWeight: 'bold' }}>{BAT_PTCH_HAND_LABEL[player.plrBatPtchHandCd ?? ''] ?? '-'}</span></InfoItem>
        <InfoItem label="연봉">
          {(() => {
            const { display, tooltip } = formatSalary(player.plrAnslSal ?? null)
            return (
              <Tooltip title={tooltip} arrow>
                <span style={{ fontWeight: 'bold', cursor: 'default' }}>{display}</span>
              </Tooltip>
            )
          })()}
        </InfoItem>
        <InfoItem label="종합능력치"><span style={{ fontWeight: 'bold' }}>{player.plrOvrlAblt?.toString() ?? '-'}</span></InfoItem>
        <InfoItem label="잠재능력치"><span style={{ fontWeight: 'bold' }}>{player.plrPotAblt?.toString() ?? '-'}</span></InfoItem>
        <InfoItem label="드래프트">
          <span style={{ fontWeight: 'bold' }}>
            {player.plrDrftRnd != null && player.plrDrftNo != null
              ? `${player.plrDrftRnd}라운드 ${player.plrDrftNo}순위`
              : '-'}
          </span>
        </InfoItem>
      </Paper>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="기본 정보" />
        <Tab label="성적" />
        <Tab label="성장 이력" />
        <Tab label="계약·연봉 이력" />
        <Tab label="부상 이력" />
      </Tabs>

      {tabIndex === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* 특성 — 능력치 위 */}
            {traits && traits.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>선수 특성</Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {traits.map((t) => (
                    <Tooltip key={t.trtCd} title={t.trtDesc ?? ''} arrow placement="top">
                      <Chip
                        label={t.trtNm ?? t.trtCd}
                        size="small"
                        sx={{ bgcolor: '#e9d8fd', color: '#6b21a8', cursor: 'default' }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Paper>
            )}

            {/* 피로도/컨디션 */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>컨디션</Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>피로도</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={fatgCond?.fatg ?? 30}
                      sx={{
                        flex: 1, height: 10, borderRadius: 5,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: (fatgCond?.fatg ?? 30) >= 80 ? 'error.main'
                            : (fatgCond?.fatg ?? 30) >= 60 ? 'warning.main' : 'success.main',
                          borderRadius: 5,
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 30 }}>
                      {fatgCond?.fatg ?? '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>컨디션</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={fatgCond?.cond ?? 70}
                      sx={{
                        flex: 1, height: 10, borderRadius: 5,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: (fatgCond?.cond ?? 70) >= 70 ? 'success.main'
                            : (fatgCond?.cond ?? 70) >= 40 ? 'warning.main' : 'error.main',
                          borderRadius: 5,
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 30 }}>
                      {fatgCond?.cond ?? '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* 능력치 */}
            {abilities.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>능력치</Typography>
                <Divider sx={{ mb: 1 }} />
                {abilities.map((a) => (
                  <Box key={a.abltCd} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', width: 72, flexShrink: 0 }}>
                      {a.abltNm ?? a.abltCd}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={((a.abltVal - 20) / 60) * 100}
                      sx={{
                        flex: 1, height: 8, borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': { bgcolor: ABILITY_GRADE_COLOR[a.abltGrade] ?? 'primary.main', borderRadius: 4 },
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', width: 24, textAlign: 'right' }}>{a.abltVal}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', width: 28, color: ABILITY_GRADE_COLOR[a.abltGrade] }}>
                      {a.abltGrade}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {/* 히든 능력치 — 능력치 아래 */}
            {hiddenAbilities && hiddenAbilities.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>히든 능력치</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>1~20 스케일 (10=평균)</Typography>
                <Divider sx={{ my: 1 }} />
                {hiddenAbilities.map((h) => (
                  <Box key={h.hideAbltCd} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', width: 80, flexShrink: 0 }}>
                      {h.hideAbltNm ?? h.hideAbltCd}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(h.hideAbltVal / 20) * 100}
                      sx={{
                        flex: 1, height: 6, borderRadius: 3,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: h.hideAbltVal >= 15 ? '#7c3aed'
                            : h.hideAbltVal >= 10 ? '#6d28d9' : '#a78bfa',
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', width: 20, textAlign: 'right' }}>{h.hideAbltVal}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {positions && positions.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>포지션 숙련도</Typography>
                <Divider sx={{ mb: 1 }} />
                {positions.map((p) => (
                  <Box key={p.posnCd} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">{p.posnNm ?? p.posnCd}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {p.posnPrfcAblt}{' '}
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>({p.posnPrfcGrade})</Typography>
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {contract && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>계약 정보</Typography>
                <Divider sx={{ mb: 1 }} />
                <Table size="small">
                  <TableBody>
                    <ContractRow label="계약 종류" value={contract.cntrctTypeNm ?? '-'} />
                    <ContractRow
                      label="계약 총액"
                      value={contract.faAmt != null ? formatSalary(contract.faAmt).display : '-'}
                      tooltip={contract.faAmt != null ? formatSalary(contract.faAmt).tooltip : undefined}
                    />
                    <ContractRow label="계약 시작" value={contract.faCntrctBgngDt ?? '-'} />
                    <ContractRow label="계약 종료" value={contract.faCntrctEndDt ?? '-'} />
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {tabIndex === 1 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>시즌별 성적</Typography>
            <Divider sx={{ mb: 1 }} />
            {!seasonStats || seasonStats.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>데이터 없음</Typography>
            ) : isPlrPitcher ? (
              <PitcherSeasonTable rows={seasonStats as PlrPtchSsntRec[]} />
            ) : (
              <BatterSeasonTable rows={seasonStats as PlrBatrSsntRec[]} />
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>월별 성적</Typography>
              {availableYears.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <InputLabel>시즌</InputLabel>
                  <Select
                    label="시즌"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {availableYears.map((yr) => (
                      <MenuItem key={yr} value={yr}>{yr}년</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
            <Divider sx={{ mb: 1 }} />
            {!monthlyStats || monthlyStats.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>데이터 없음</Typography>
            ) : isPlrPitcher ? (
              <PitcherMonthlyTable rows={monthlyStats as PlrPtchMonRec[]} />
            ) : (
              <BatterMonthlyTable rows={monthlyStats as PlrBatrMonRec[]} />
            )}
          </Paper>
        </Box>
      )}

      {tabIndex === 2 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>성장 이력</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {abilityViewMode === 'monthly' && (
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <InputLabel>시즌</InputLabel>
                  <Select
                    label="시즌"
                    value={abilityChartYear}
                    onChange={(e) => setAbilityChartYear(Number(e.target.value))}
                  >
                    {abilityYears.map((yr) => (
                      <MenuItem key={yr} value={yr}>{yr}년</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <ToggleButtonGroup
                size="small"
                exclusive
                value={abilityViewMode}
                onChange={(_, v) => { if (v) setAbilityViewMode(v) }}
              >
                <ToggleButton value="yearly">연별</ToggleButton>
                <ToggleButton value="monthly">월별</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {abilityViewMode === 'yearly' ? (
            !abilityHistory || abilityHistory.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>데이터 없음</Typography>
            ) : (
              <AbilityLineChart rows={abilityHistory} xKey="ssntYr" xLabel={(v) => `${v}년`} />
            )
          ) : (
            !abilityMonthlyHistory || abilityMonthlyHistory.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>데이터 없음</Typography>
            ) : (
              <AbilityLineChart rows={abilityMonthlyHistory} xKey="mon" xLabel={(v) => `${v}월`} />
            )
          )}
        </Paper>
      )}

      {tabIndex === 3 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>계약 이력</Typography>
              <Divider sx={{ mb: 1 }} />
              {!contractHistory || contractHistory.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>데이터 없음</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>구단</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>종류</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>기간</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>총액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contractHistory.map((h) => {
                      const { display, tooltip } = formatSalary(h.faAmt)
                      return (
                        <TableRow key={h.histSeq}>
                          <TableCell>{h.tmKrNm ?? 'FA'}</TableCell>
                          <TableCell>{h.cntrctTypeNm ?? '-'}</TableCell>
                          <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                            {h.faCntrctBgngDt ?? '-'} ~ {h.faCntrctEndDt ?? '-'}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={tooltip} arrow placement="left">
                              <span style={{ cursor: 'default' }}>{display}</span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>연봉 이력</Typography>
              <Divider sx={{ mb: 1 }} />
              {!salaryHistory || salaryHistory.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>데이터 없음</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>시즌</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>연봉</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaryHistory.map((s) => {
                      const { display, tooltip } = formatSalary(s.anslSal)
                      return (
                        <TableRow key={s.ssntYr}>
                          <TableCell>{s.ssntYr}년</TableCell>
                          <TableCell align="right">
                            <Tooltip title={tooltip} arrow placement="left">
                              <span style={{ cursor: 'default' }}>{display}</span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabIndex === 4 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>부상 이력</Typography>
          <Divider sx={{ mb: 1 }} />
          {!injuryHistory || injuryHistory.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>부상 이력이 없습니다.</Typography>
          ) : (
            <InjuryHistoryTable rows={injuryHistory} />
          )}
        </Paper>
      )}

      <PlrEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        player={player}
        abilities={abilities ?? []}
        positions={positions ?? []}
        fatgCond={fatgCond}
      />

      <Dialog open={releaseOpen} onClose={() => setReleaseOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>외국인 선수 계약 해지</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <b>{player.plrNm}</b> 선수와의 계약을 해지하시겠습니까?
          </Typography>
          <Alert severity="warning" sx={{ mb: 1 }}>
            방출된 선수는 즉시 로스터·라인업·로테이션·불펜에서 제외되며, 같은 시즌에 다른 외국인 선수를 영입할 수 있게 됩니다.
          </Alert>
          {releaseMutation.isError && (
            <Alert severity="error" sx={{ mt: 1 }}>계약 해지에 실패했습니다.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReleaseOpen(false)} disabled={releaseMutation.isPending}>취소</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => releaseMutation.mutate()}
            disabled={releaseMutation.isPending}
          >
            {releaseMutation.isPending ? '처리 중...' : '계약 해지'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  )
}

function ContractRow({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <TableRow>
      <TableCell sx={{ color: 'text.secondary', border: 'none', py: 0.5 }}>{label}</TableCell>
      <TableCell align="right" sx={{ fontWeight: 'bold', border: 'none', py: 0.5 }}>
        {tooltip ? (
          <Tooltip title={tooltip} arrow>
            <span style={{ cursor: 'default' }}>{value}</span>
          </Tooltip>
        ) : value}
      </TableCell>
    </TableRow>
  )
}

function SeasonYearCell({ ssntYr, tmShrtEngNm }: { ssntYr: number; tmShrtEngNm?: string | null }) {
  const { getCiClr, getEmblemPath } = useTeamMeta()
  const ciClr = getCiClr(tmShrtEngNm)
  const emblem = getEmblemPath(tmShrtEngNm)
  return (
    <TableCell
      sx={ciClr ? {
        bgcolor: ciClr, color: '#fff', fontWeight: 'bold',
        whiteSpace: 'nowrap', p: '4px 8px',
      } : { fontWeight: 'bold', whiteSpace: 'nowrap' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {emblem && (
          <Box
            component="img"
            src={emblem}
            alt={tmShrtEngNm ?? ''}
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0,
              filter: ciClr ? 'brightness(0) invert(1)' : 'none' }}
          />
        )}
        {ssntYr}
      </Box>
    </TableCell>
  )
}

function BatterSeasonTable({ rows }: { rows: PlrBatrSsntRec[] }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>시즌</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>구단</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>G</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>PA</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>AB</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>H</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>2B</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>3B</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>HR</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>RBI</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>R</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>BB</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SO</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SB</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>AVG</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>OBP</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SLG</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>OPS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.ssntYr} hover>
              <SeasonYearCell ssntYr={r.ssntYr} tmShrtEngNm={r.tmShrtEngNm} />
              <TableCell>{r.tmKrNm ?? '-'}</TableCell>
              <TableCell align="right">{r.g}</TableCell>
              <TableCell align="right">{r.pa}</TableCell>
              <TableCell align="right">{r.ab}</TableCell>
              <TableCell align="right">{r.h}</TableCell>
              <TableCell align="right">{r.dobl}</TableCell>
              <TableCell align="right">{r.trpl}</TableCell>
              <TableCell align="right">{r.hr}</TableCell>
              <TableCell align="right">{r.rbi}</TableCell>
              <TableCell align="right">{r.r}</TableCell>
              <TableCell align="right">{r.bb}</TableCell>
              <TableCell align="right">{r.so}</TableCell>
              <TableCell align="right">{r.sb}</TableCell>
              <TableCell align="right">{fmtStat(r.ba)}</TableCell>
              <TableCell align="right">{fmtStat(r.obp)}</TableCell>
              <TableCell align="right">{fmtStat(r.slg)}</TableCell>
              <TableCell align="right">{fmtStat(r.ops)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

function PitcherSeasonTable({ rows }: { rows: PlrPtchSsntRec[] }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>시즌</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>구단</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>G</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>GS</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>IP</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>W</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>L</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SV</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>HLD</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>H</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>HR</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>BB</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SO</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>ERA</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>WHIP</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.ssntYr} hover>
              <SeasonYearCell ssntYr={r.ssntYr} tmShrtEngNm={r.tmShrtEngNm} />
              <TableCell>{r.tmKrNm ?? '-'}</TableCell>
              <TableCell align="right">{r.g}</TableCell>
              <TableCell align="right">{r.gs}</TableCell>
              <TableCell align="right">{fmtIp(r.ipOut)}</TableCell>
              <TableCell align="right">{r.w}</TableCell>
              <TableCell align="right">{r.l}</TableCell>
              <TableCell align="right">{r.sv}</TableCell>
              <TableCell align="right">{r.hld}</TableCell>
              <TableCell align="right">{r.h}</TableCell>
              <TableCell align="right">{r.hr}</TableCell>
              <TableCell align="right">{r.bb}</TableCell>
              <TableCell align="right">{r.so}</TableCell>
              <TableCell align="right">{fmtStat(r.era, 2)}</TableCell>
              <TableCell align="right">{fmtStat(r.whip, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

function BatterMonthlyTable({ rows }: { rows: PlrBatrMonRec[] }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 500 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>월</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>G</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>PA</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>AB</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>H</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>HR</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>RBI</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>BB</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SO</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SB</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>AVG</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>OBP</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SLG</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>OPS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.mon} hover>
              <TableCell>{r.mon}월</TableCell>
              <TableCell align="right">{r.g}</TableCell>
              <TableCell align="right">{r.pa}</TableCell>
              <TableCell align="right">{r.ab}</TableCell>
              <TableCell align="right">{r.h}</TableCell>
              <TableCell align="right">{r.hr}</TableCell>
              <TableCell align="right">{r.rbi}</TableCell>
              <TableCell align="right">{r.bb}</TableCell>
              <TableCell align="right">{r.so}</TableCell>
              <TableCell align="right">{r.sb}</TableCell>
              <TableCell align="right">{fmtStat(r.ba)}</TableCell>
              <TableCell align="right">{fmtStat(r.obp)}</TableCell>
              <TableCell align="right">{fmtStat(r.slg)}</TableCell>
              <TableCell align="right">{fmtStat(r.ops)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

function PitcherMonthlyTable({ rows }: { rows: PlrPtchMonRec[] }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 500 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>월</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>G</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>GS</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>IP</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>W</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>L</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SV</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>HLD</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>H</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>HR</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>BB</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>SO</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>ERA</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>WHIP</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.mon} hover>
              <TableCell>{r.mon}월</TableCell>
              <TableCell align="right">{r.g}</TableCell>
              <TableCell align="right">{r.gs}</TableCell>
              <TableCell align="right">{fmtIp(r.ipOut)}</TableCell>
              <TableCell align="right">{r.w}</TableCell>
              <TableCell align="right">{r.l}</TableCell>
              <TableCell align="right">{r.sv}</TableCell>
              <TableCell align="right">{r.hld}</TableCell>
              <TableCell align="right">{r.h}</TableCell>
              <TableCell align="right">{r.hr}</TableCell>
              <TableCell align="right">{r.bb}</TableCell>
              <TableCell align="right">{r.so}</TableCell>
              <TableCell align="right">{fmtStat(r.era, 2)}</TableCell>
              <TableCell align="right">{fmtStat(r.whip, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

function InjuryHistoryTable({ rows }: { rows: PlrInjryHist[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold' }}>날짜</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>시즌</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>제목</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => (
          <>
            <TableRow
              key={r.evntId}
              hover
              sx={{ cursor: r.evntCnts ? 'pointer' : 'default' }}
              onClick={() => r.evntCnts && setExpanded(expanded === r.evntId ? null : r.evntId)}
            >
              <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: 12 }}>{r.evntDt ?? '-'}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.ssntYr ?? '-'}년</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={r.evntTypeCd === 'INJ' ? '부상' : r.evntTypeCd === 'RCV' ? '회복' : (r.evntTypeCd ?? '-')}
                    size="small"
                    color={r.evntTypeCd === 'INJ' ? 'error' : r.evntTypeCd === 'RCV' ? 'success' : 'default'}
                    sx={{ height: 18, fontSize: 11, '& .MuiChip-label': { px: 0.75 } }}
                  />
                  <Typography variant="body2">{r.evntTtlt ?? '-'}</Typography>
                </Box>
              </TableCell>
            </TableRow>
            {expanded === r.evntId && r.evntCnts && (
              <TableRow key={`${r.evntId}-detail`}>
                <TableCell colSpan={3} sx={{ bgcolor: 'grey.50', py: 1.5, px: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {r.evntCnts}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  )
}

const CHART_COLORS = [
  '#63b3ed', '#68d391', '#f6c90e', '#fc8181', '#b794f4',
  '#76e4f7', '#f6ad55', '#a3bffa', '#9ae6b4', '#fbb6ce',
]

function AbilityLineChart({ rows, xKey, xLabel }: {
  rows: (PlrAbltSsnt | PlrAbltMon)[]
  xKey: 'ssntYr' | 'mon'
  xLabel: (v: number) => string
}) {
  const abltCodes = Array.from(new Set(rows.map((r) => r.abltCd))).sort()
  const abltName = (cd: string) => rows.find((r) => r.abltCd === cd)?.abltNm ?? cd
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const getXVal = (r: PlrAbltSsnt | PlrAbltMon): number =>
    xKey === 'mon' ? (r as PlrAbltMon).mon : (r as PlrAbltSsnt).ssntYr

  const xValues = Array.from(new Set(rows.map(getXVal))).sort((a, b) => a - b)
  const chartData = xValues.map((x) => {
    const point: Record<string, number> = { x }
    for (const cd of abltCodes) {
      const row = rows.find((r) => getXVal(r) === x && r.abltCd === cd)
      if (row) point[cd] = row.abltVal
    }
    return point
  })

  const toggleAblt = (cd: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(cd)) next.delete(cd)
      else next.add(cd)
      return next
    })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
        {abltCodes.map((cd, i) => {
          const isHidden = hidden.has(cd)
          return (
            <Chip
              key={cd}
              label={abltName(cd)}
              size="small"
              onClick={() => toggleAblt(cd)}
              sx={{
                cursor: 'pointer',
                bgcolor: isHidden ? 'transparent' : `${CHART_COLORS[i % CHART_COLORS.length]}22`,
                color: isHidden ? 'text.disabled' : CHART_COLORS[i % CHART_COLORS.length],
                borderColor: CHART_COLORS[i % CHART_COLORS.length],
                border: '1px solid',
                opacity: isHidden ? 0.4 : 1,
                fontWeight: 'bold',
              }}
            />
          )
        })}
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="x" tickFormatter={(v) => xLabel(v as number)} tick={{ fontSize: 12 }} />
          <YAxis domain={[20, 80]} tick={{ fontSize: 12 }} width={32} />
          <RechartsTooltip
            formatter={(value, name) => [value, abltName(String(name))]}
            labelFormatter={(label) => xLabel(label as number)}
          />
          {abltCodes.map((cd, i) => (
            <Line
              key={cd}
              type="monotone"
              dataKey={cd}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              hide={hidden.has(cd)}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}
