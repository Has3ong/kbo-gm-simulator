import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableRow, TableCell, TableHead,
  CircularProgress, Chip, Divider, Tabs, Tab, ToggleButtonGroup, ToggleButton,
  Button, IconButton, Tooltip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import StadiumIcon from '@mui/icons-material/Stadium'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useTeamDetailPage } from './TeamDetailPageHooks'
import { formatSalary } from '../../utils/format'
import FcltyUpgrModal from '../../components/FcltyUpgrModal'
import StdmExpnModal from '../../components/StdmExpnModal'

const STATION_COLORS: Record<string, string> = {
  SBS: '#2563EB', KBS: '#DC2626', MBC: '#16A34A',
}

const UPGR_STTS_LABEL: Record<string, string> = {
  PLAN: '계획중', PROG: '진행중', CMPL: '완료', CNCL: '취소',
}

const PSTSSNT_LABEL: Record<string, string> = {
  UNDC: '-', ELIM: '탈락', CLWC: 'WC', CLPS: 'PS', CL1P: '1위', CHMP: '우승',
}

const PSTSSNT_COLOR: Record<string, 'default' | 'error' | 'warning' | 'success' | 'primary'> = {
  UNDC: 'default', ELIM: 'error', CLWC: 'warning', CLPS: 'primary', CL1P: 'success', CHMP: 'success',
}

// 시설별 아이콘 이모지 (간단 표현)
const FCLTY_ICON: Record<string, string> = {
  TRNG: '🏋️', YUTH: '🌱', ANLY: '📊', SCTG: '🔭', CAFE: '🍽️', GRSS: '🌿',
}

export default function TeamDetailPage() {
  const {
    team, finance, financeHistory, facilities, facilityUpgrades, fcltyUpgrCosts,
    market, standingsHistory, stadium, stdmExpnHistory, stdmExpnCosts,
    broadcaster, isLoading, ssntYr, formatMoney, FCLTY_LVL_LABEL,
    isUserTeam, tabIndex, setTabIndex, financeSubTab, setFinanceSubTab,
    financeViewMode, setFinanceViewMode,
    upgrTarget, setUpgrTarget, expnOpen, setExpnOpen, tmIdNum,
  } = useTeamDetailPage()

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (!team) return <Typography sx={{ color: 'error.main', mt: 2 }}>팀을 찾을 수 없습니다.</Typography>

  const ciClr = team.ciClr ?? '#1976d2'
  const logoSrc = team.emblemCd ? `/img/logo/${team.emblemCd}` : null

  return (
    <Box>
      <RouterLink to="/teams" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, color: 'inherit', textDecoration: 'none', fontSize: 14 }}>
        <ArrowBackIcon sx={{ fontSize: 16 }} /> 구단 목록
      </RouterLink>

      {/* 팀 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {logoSrc && (
          <Box component="img" src={logoSrc} alt={team.tmKrNm}
            sx={{ width: 64, height: 64, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: ciClr }}>{team.tmKrNm}</Typography>
            {isUserTeam && <Chip label="내 팀" size="small" sx={{ bgcolor: ciClr, color: 'white', fontWeight: 'bold' }} />}
          </Box>
          {team.tmEngNm && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{team.tmEngNm}</Typography>}
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, display: 'flex', gap: 4, flexWrap: 'wrap', borderColor: ciClr, borderWidth: 1.5 }}>
        <InfoItem label="연고지" value={team.cityNm ?? '-'} />
        <InfoItem label="홈구장" value={team.stdmKrNm ?? '-'} />
        <InfoItem label="창단" value={team.tmEstblshDt?.slice(0, 4) ? `${team.tmEstblshDt.slice(0, 4)}년` : '-'} />
        <InfoItem
          label="구단 잔고"
          value={finance?.curCash != null ? `${finance.curCash.toLocaleString()}만원` : '-'}
        />
      </Paper>

      {/* 탭 */}
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={{
          mb: 2, borderBottom: 1, borderColor: 'divider',
          '& .MuiTab-root.Mui-selected': { color: ciClr },
          '& .MuiTabs-indicator': { backgroundColor: ciClr },
        }}
      >
        <Tab label="현황" />
        <Tab label="재정" />
        <Tab label="시설 이력" />
        <Tab label="팬덤" />
      </Tabs>

      {/* 현황 탭 */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          {/* 방송국 스폰서 */}
          {isUserTeam && broadcaster && (
            <Grid size={12}>
              <Paper variant="outlined" sx={{ p: 2, borderColor: STATION_COLORS[broadcaster.brdcstCd] ?? 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>방송국 스폰서</Typography>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip label={broadcaster.brdcstNm}
                    sx={{ bgcolor: STATION_COLORS[broadcaster.brdcstCd] ?? '#555', color: 'white', fontWeight: 'bold', fontSize: 14 }}
                  />
                  <BrdcstDetail label="계약금" value={formatSalary(broadcaster.cntrctFee).display} />
                  <BrdcstDetail label="승리 수당" value={`${broadcaster.winBonus.toLocaleString()}만/승`} />
                  <BrdcstDetail label="포스트 수당" value={formatSalary(broadcaster.postBonus).display} />
                  <BrdcstDetail label="우승 수당" value={formatSalary(broadcaster.ksBonus).display} />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* 경기장 정보 */}
          {stadium && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StadiumIcon sx={{ color: ciClr, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>경기장</Typography>
                  </Box>
                  {isUserTeam && stdmExpnCosts.length > 0 && (
                    <Tooltip title="경기장 증축">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setExpnOpen(true)}
                        sx={{ borderColor: ciClr, color: ciClr, fontSize: 12 }}
                      >
                        증축
                      </Button>
                    </Tooltip>
                  )}
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{stadium.stdmKrNm}</Typography>
                {stadium.stdmLoc && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>{stadium.stdmLoc}</Typography>}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <StdmRow label="수용 인원" value={`${stadium.stdmSeatCnt?.toLocaleString() ?? '-'}석`} />
                  {stadium.turfTypeNm && <StdmRow label="잔디" value={stadium.turfTypeNm} />}
                  {stadium.lfDist && (
                    <StdmRow label="펜스 거리" value={`좌 ${stadium.lfDist}m / 중 ${stadium.cfDist}m / 우 ${stadium.rfDist}m`} />
                  )}
                </Box>
                {/* 증축 이력 */}
                {stdmExpnHistory.length > 0 && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', display: 'block', mb: 0.5 }}>증축 이력</Typography>
                    {stdmExpnHistory.slice(0, 3).map((e) => (
                      <Box key={e.expnId} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {e.expnBgngDt?.slice(0, 10)} +{(e.aftSeatCnt - e.bfrSeatCnt).toLocaleString()}석
                        </Typography>
                        <Chip label={e.expnSttsNm ?? e.expnSttsCd} size="small"
                          color={e.expnSttsCd === 'CMPL' ? 'success' : e.expnSttsCd === 'PROG' ? 'primary' : 'default'}
                          sx={{ height: 16, fontSize: 10 }}
                        />
                      </Box>
                    ))}
                  </>
                )}
              </Paper>
            </Grid>
          )}

          {/* 시설 현황 */}
          <Grid size={{ xs: 12, md: stadium ? 7 : 12 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>시설 현황</Typography>
              <Divider sx={{ mb: 1.5 }} />
              {fcltyUpgrCosts.length === 0 && facilities.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>시설 정보 없음</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {fcltyUpgrCosts.map((c) => (
                    <Box key={c.fcltyTypeCd}
                      sx={{
                        border: '1px solid', borderColor: 'divider', borderRadius: 1,
                        p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
                      }}
                    >
                      <Typography sx={{ fontSize: 22, lineHeight: 1 }}>
                        {FCLTY_ICON[c.fcltyTypeCd] ?? '🏢'}
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{c.fcltyTypeNm}</Typography>
                          <Chip
                            label={`Lv.${c.fromLvl} ${FCLTY_LVL_LABEL[c.fromLvl] ?? ''}`}
                            size="small"
                            color={c.fromLvl >= 5 ? 'success' : c.fromLvl >= 3 ? 'primary' : 'default'}
                          />
                          {c.maxLevel && <Chip label="최고 등급" size="small" color="warning" />}
                        </Box>
                        {c.fcltyDesc && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                            {c.fcltyDesc}
                          </Typography>
                        )}
                        {!c.maxLevel && c.upgrCost != null && (
                          <Typography variant="caption" sx={{ color: ciClr }}>
                            Lv.{c.toLvl} 업그레이드 비용: {c.upgrCost.toLocaleString()}만원 ({c.upgrDays}일)
                          </Typography>
                        )}
                      </Box>
                      {isUserTeam && !c.maxLevel && (() => {
                        const curCash = finance?.curCash ?? 0
                        const cost = c.upgrCost ?? 0
                        const canAfford = curCash >= cost
                        const tip = canAfford
                          ? '업그레이드'
                          : `재정 부족 (보유 ${curCash.toLocaleString()}만원 / 필요 ${cost.toLocaleString()}만원)`
                        return (
                          <Tooltip title={tip}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={!canAfford}
                                onClick={() => setUpgrTarget(c)}
                                sx={{
                                  color: canAfford ? ciClr : 'text.disabled',
                                  border: '1px solid',
                                  borderColor: canAfford ? ciClr : 'divider',
                                  borderRadius: 1,
                                  p: 0.5,
                                }}
                              >
                                <UpgradeIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )
                      })()}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* 연도별 순위·성적 */}
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>연도별 순위·성적</Typography>
              <Divider sx={{ mb: 1 }} />
              {standingsHistory.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>성적 기록 없음</Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>시즌</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>순위</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>승-패-무</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>승률</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>게임차</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>득실차</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>포스트</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {standingsHistory.map((s) => (
                        <TableRow key={s.ssntYr} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{s.ssntYr}년</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${s.stndRnk ?? '-'}위`}
                              size="small"
                              sx={{
                                bgcolor: s.stndRnk === 1 ? '#f59e0b' : s.stndRnk != null && s.stndRnk <= 5 ? ciClr : 'grey.300',
                                color: s.stndRnk != null && s.stndRnk <= 5 ? 'white' : 'text.primary',
                                fontWeight: 'bold',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">{s.w}-{s.l}-{s.t}</TableCell>
                          <TableCell align="center">{s.pct != null ? s.pct.toFixed(3) : '-'}</TableCell>
                          <TableCell align="center">{s.gb != null ? (s.gb === 0 ? '-' : s.gb.toFixed(1)) : '-'}</TableCell>
                          <TableCell align="center" sx={{ color: (s.runDiff ?? 0) >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                            {s.runDiff != null ? (s.runDiff >= 0 ? `+${s.runDiff}` : s.runDiff) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {s.pstssntStts ? (
                              <Chip label={PSTSSNT_LABEL[s.pstssntStts] ?? s.pstssntStts} size="small"
                                color={PSTSSNT_COLOR[s.pstssntStts] ?? 'default'} />
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* 재정 탭 */}
      {tabIndex === 1 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Tabs value={financeSubTab} onChange={(_, v) => setFinanceSubTab(v)}
            sx={{
              mb: 2, borderBottom: 1, borderColor: 'divider',
              '& .MuiTab-root.Mui-selected': { color: ciClr },
              '& .MuiTabs-indicator': { backgroundColor: ciClr },
            }}
          >
            <Tab label="재정 요약" />
            <Tab label="재정 이력" />
          </Tabs>

          {financeSubTab === 0 && (
            finance ? (
              <Table size="small" sx={{ maxWidth: 480 }}>
                <TableBody>
                  <FinanceRow label="보유 현금" value={formatMoney(finance.curCash)} />
                  <FinanceRow label="선수단 예산" value={formatMoney(finance.plrSalBdgt)} />
                  <FinanceRow label="현재 연봉 총액" value={formatMoney(finance.curPlrSalCost)} />
                  <FinanceRow label="입장 수익" value={formatMoney(finance.tcktRev)} />
                  <FinanceRow label="방송 수익" value={formatMoney(finance.bcstRev)} />
                  <FinanceRow label="스폰서 수익" value={formatMoney(finance.spnsRev)} />
                  <FinanceRow label="부채" value={formatMoney(finance.debt)} />
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>재정 정보 없음</Typography>
            )
          )}

          {financeSubTab === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                <ToggleButtonGroup size="small" exclusive value={financeViewMode}
                  onChange={(_, v) => { if (v) setFinanceViewMode(v) }}>
                  <ToggleButton value="table">표</ToggleButton>
                  <ToggleButton value="chart">그래프</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {financeHistory.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>이력 없음</Typography>
              ) : financeViewMode === 'table' ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        {['시즌', '보유현금', '선수단예산', '입장수익', '방송수익', '스폰서수익', '부채'].map((h, i) => (
                          <TableCell key={h} sx={{ fontWeight: 'bold' }} align={i === 0 ? 'left' : 'right'}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {financeHistory.map((f) => (
                        <TableRow key={f.ssntYr} hover>
                          <TableCell sx={{ fontWeight: 'bold' }}>{f.ssntYr}년</TableCell>
                          <TableCell align="right">{formatMoney(f.curCash)}</TableCell>
                          <TableCell align="right">{formatMoney(f.plrSalBdgt)}</TableCell>
                          <TableCell align="right">{formatMoney(f.tcktRev)}</TableCell>
                          <TableCell align="right">{formatMoney(f.bcstRev)}</TableCell>
                          <TableCell align="right">{formatMoney(f.spnsRev)}</TableCell>
                          <TableCell align="right">{formatMoney(f.debt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <FinanceChart data={financeHistory} ciClr={ciClr} />
              )}
            </>
          )}
        </Paper>
      )}

      {/* 시설 이력 탭 */}
      {tabIndex === 2 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>시설 업그레이드 이력</Typography>
          <Divider sx={{ mb: 1 }} />
          {facilityUpgrades.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>이력 없음</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>시설</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>변경</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>비용</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>기간</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facilityUpgrades.map((u) => (
                  <TableRow key={u.upgrId} hover>
                    <TableCell>
                      {FCLTY_ICON[u.fcltyTypeCd] ?? '🏢'} {u.fcltyTypeNm ?? u.fcltyTypeCd}
                    </TableCell>
                    <TableCell align="center">Lv.{u.fromLvl ?? '-'} → Lv.{u.toLvl ?? '-'}</TableCell>
                    <TableCell align="right">{formatMoney(u.upgrCost)}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{u.upgrBgngDt ?? '-'} ~ {u.upgrEndDt ?? '-'}</TableCell>
                    <TableCell align="center">
                      <Chip label={UPGR_STTS_LABEL[u.upgrSttsCd ?? ''] ?? '-'} size="small"
                        color={u.upgrSttsCd === 'CMPL' ? 'success' : u.upgrSttsCd === 'PROG' ? 'primary' : u.upgrSttsCd === 'CNCL' ? 'error' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {/* 팬덤 탭 */}
      {tabIndex === 3 && market && (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 480 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{ssntYr}시즌 팬덤</Typography>
          <Divider sx={{ mb: 1 }} />
          <Table size="small">
            <TableBody>
              <FinanceRow label="팀 인기" value={market.ppltRtg?.toString() ?? '-'} />
              <FinanceRow label="팬 충성도" value={market.fanLylty?.toString() ?? '-'} />
              <FinanceRow label="팬 기대치" value={market.fanExp?.toString() ?? '-'} />
              <FinanceRow label="경기당 평균 관중" value={market.avgAtndCnt?.toLocaleString() ?? '-'} />
              <FinanceRow label="시즌권 보유자" value={market.ssntTcktHldr?.toLocaleString() ?? '-'} />
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* 시설 업그레이드 다이얼로그 */}
      <FcltyUpgrModal
        open={upgrTarget != null}
        onClose={() => setUpgrTarget(null)}
        tmId={tmIdNum}
        cost={upgrTarget}
        ciClr={ciClr}
      />

      {/* 경기장 증축 다이얼로그 */}
      {stadium && (
        <StdmExpnModal
          open={expnOpen}
          onClose={() => setExpnOpen(false)}
          tmId={tmIdNum}
          stadium={stadium}
          costs={stdmExpnCosts}
          ciClr={ciClr}
        />
      )}
    </Box>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
  )
}

function StdmRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
  )
}

function FinanceRow({ label, value }: { label: string; value: string }) {
  return (
    <TableRow>
      <TableCell sx={{ color: 'text.secondary', border: 'none', py: 0.5 }}>{label}</TableCell>
      <TableCell align="right" sx={{ fontWeight: 'bold', border: 'none', py: 0.5 }}>{value}</TableCell>
    </TableRow>
  )
}

function BrdcstDetail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Box>
  )
}

interface FinanceChartProps {
  data: Array<{ ssntYr?: number; curCash?: number | null; plrSalBdgt?: number | null; tcktRev?: number | null; bcstRev?: number | null }>
  ciClr: string
}

function FinanceChart({ data, ciClr }: FinanceChartProps) {
  const chartData = [...data].reverse().map((f) => ({
    year: `${f.ssntYr}년`,
    보유현금: f.curCash ?? 0,
    선수단예산: f.plrSalBdgt ?? 0,
    입장수익: f.tcktRev ?? 0,
    방송수익: f.bcstRev ?? 0,
  }))
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => v >= 10000 ? `${Math.round(v / 10000)}억` : `${v}만`} tick={{ fontSize: 11 }} width={52} />
        <RechartsTooltip formatter={(value) => [`${Number(value).toLocaleString()}만원`]} />
        <Legend />
        <Line type="monotone" dataKey="보유현금" stroke={ciClr} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="선수단예산" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="입장수익" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="방송수익" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
