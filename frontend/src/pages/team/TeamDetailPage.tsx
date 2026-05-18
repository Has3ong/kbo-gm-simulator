import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableRow, TableCell, TableHead,
  CircularProgress, Chip, Divider, Tabs, Tab, ToggleButtonGroup, ToggleButton,
  Button, IconButton, Tooltip, TableContainer,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import StadiumIcon from '@mui/icons-material/Stadium'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, Sankey,
} from 'recharts'
import { useTeamDetailPage } from './TeamDetailPageHooks'
import { formatSalary } from '../../utils/format'
import FcltyUpgrModal from '../../components/FcltyUpgrModal'
import StdmExpnModal from '../../components/StdmExpnModal'
import { REPR_POSN_LABEL, PLR_STTS_LABEL } from '../../types/player'
import { STFF_TYPE_LABEL } from '../../types/staff'

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

const LOG_TYPE_LABEL: Record<string, string> = { INCOME: '수입', EXPENSE: '지출' }
const LOG_CTGR_LABEL: Record<string, string> = {
  SPRING_CAMP: '스프링 캠프', FCLTY_UPGR: '시설 업그레이드', STDM_EXP: '경기장 증축',
  TICKET: '입장권', SPONSOR: '스폰서', BROADCAST: '방송', SALARY: '연봉', OTHER: '기타',
}

export default function TeamDetailPage() {
  const {
    team, finance, financeHistory, financeLog, facilities, facilityUpgrades, fcltyUpgrCosts,
    market, standingsHistory, stadium, stdmExpnHistory, stdmExpnCosts,
    broadcaster, isLoading, ssntYr, formatMoney, FCLTY_LVL_LABEL,
    isUserTeam, tabIndex, setTabIndex, financeSubTab, setFinanceSubTab,
    financeViewMode, setFinanceViewMode,
    upgrTarget, setUpgrTarget, expnOpen, setExpnOpen, tmIdNum,
    teamPlayers, teamStaffs,
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
        <Tab label="선수" />
        <Tab label="스태프" />
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
            <Tab label="재정 상세 이력" />
          </Tabs>

          {financeSubTab === 0 && (
            finance ? (
              <Grid container spacing={3}>
                {/* 좌측: 수입/보유 현황 */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>보유 현황</Typography>
                    <Table size="small">
                      <TableBody>
                        <FinanceRow label="보유 현금" value={formatMoney(finance.curCash)} bold hint="실시간" />
                      </TableBody>
                    </Table>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>수입 (당해 누계)</Typography>
                    <Table size="small">
                      <TableBody>
                        <FinanceRow label="입장 수익" value={formatMoney(finance.tcktRev)} />
                        <FinanceRow label="방송 수익" value={formatMoney(finance.bcstRev)} />
                        <FinanceRow label="방송 수당" value={formatMoney(finance.bcstBonusYtd)} hint="WIN_BONUS × 승수" />
                        <FinanceRow label="스폰서 수익" value={formatMoney(finance.spnsRev)} />
                        <FinanceRow
                          label="수입 합계"
                          value={formatMoney((finance.tcktRev ?? 0) + (finance.bcstRev ?? 0) + (finance.bcstBonusYtd ?? 0) + (finance.spnsRev ?? 0))}
                          bold
                        />
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
                {/* 우측: 지출 현황 */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>지출 현황</Typography>
                    <Table size="small">
                      <TableBody>
                        <FinanceRow label="선수단 연봉 총액" value={formatMoney(finance.plrActualSal)} hint="활성 선수" />
                        <FinanceRow label="코치 연봉 총액" value={formatMoney(finance.coachActualSal)} hint="감독·코치" />
                        <FinanceRow
                          label="현재 연봉 총액"
                          value={formatMoney((finance.plrActualSal ?? 0) + (finance.coachActualSal ?? 0))}
                          bold
                        />
                        <FinanceRow label="부채" value={formatMoney(finance.debt)} />
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>재정 정보 없음</Typography>
            )
          )}

          {financeSubTab === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
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

          {financeSubTab === 2 && (
            financeLog.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>재정 이력 없음</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['날짜', '시즌', '구분', '카테고리', '금액', '메모'].map((h, i) => (
                        <TableCell key={h} sx={{ fontWeight: 'bold' }} align={i >= 4 ? 'right' : 'left'}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {financeLog.map((log) => (
                      <TableRow key={log.logId} hover>
                        <TableCell>{log.logDt}</TableCell>
                        <TableCell>{log.ssntYr}년</TableCell>
                        <TableCell>
                          <Chip
                            label={LOG_TYPE_LABEL[log.logTypeCd] ?? log.logTypeCd}
                            size="small"
                            color={log.logTypeCd === 'INCOME' ? 'success' : 'error'}
                            sx={{ height: 18, fontSize: 10 }}
                          />
                        </TableCell>
                        <TableCell>{LOG_CTGR_LABEL[log.logCtgrCd] ?? log.logCtgrCd}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: log.logTypeCd === 'INCOME' ? 'success.main' : 'error.main' }}>
                          {log.logTypeCd === 'INCOME' ? '+' : '-'}{log.amount.toLocaleString()}만원
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', fontSize: 12 }}>{log.memo ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )
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

      {/* 선수 탭 */}
      {tabIndex === 4 && (
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
              {teamPlayers.map((p) => (
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
                      color={p.plrSttsCd === 'AT' ? 'success' : p.plrSttsCd === 'INJ' ? 'error' : 'default'}
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

      {/* 스태프 탭 */}
      {tabIndex === 5 && (
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
              {teamStaffs.map((s) => (
                <TableRow key={s.stffId} hover>
                  <TableCell>
                    {s.stffNm}
                    {s.stffFrgnYn === '1' && (
                      <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem', ml: 0.5 }}>(외)</Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STFF_TYPE_LABEL[s.stffTypeCd ?? ''] ?? '-'}
                      size="small"
                      color={
                        s.stffTypeCd === 'MGR' ? 'primary'
                        : s.stffTypeCd === 'COACH' ? 'secondary'
                        : s.stffTypeCd === 'SCUT' ? 'success'
                        : s.stffTypeCd === 'MED' ? 'warning'
                        : 'default'
                      }
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

function FinanceRow({ label, value, hint, bold }: { label: string; value: string; hint?: string; bold?: boolean }) {
  return (
    <TableRow sx={bold ? { bgcolor: 'action.hover' } : undefined}>
      <TableCell sx={{ color: 'text.secondary', border: 'none', py: 0.5 }}>
        {label}
        {hint && <Typography component="span" variant="caption" sx={{ color: 'text.disabled', ml: 0.5 }}>({hint})</Typography>}
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: bold ? 'bold' : 'normal', border: 'none', py: 0.5, fontSize: bold ? '0.95rem' : undefined }}>{value}</TableCell>
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
  data: Array<{
    ssntYr?: number
    curCash?: number | null
    plrSalBdgt?: number | null
    tcktRev?: number | null
    bcstRev?: number | null
    spnsRev?: number | null
    plrSalCost?: number | null
    stffCost?: number | null
    oprCost?: number | null
  }>
  ciClr: string
}

const yTickFmt = (v: number) => v >= 10000 ? `${Math.round(v / 10000)}억` : `${v}만`
const tooltipFmt = (value: unknown) => [`${Number(value).toLocaleString()}만원`]

function FinanceChart({ data, ciClr }: FinanceChartProps) {
  const sorted = [...data].reverse()

  // 차트 1 & 2: 수입 항목별 데이터
  const incomeData = sorted.map((f) => ({
    year: `${f.ssntYr}년`,
    입장수익: f.tcktRev ?? 0,
    방송수익: f.bcstRev ?? 0,
    스폰서수익: f.spnsRev ?? 0,
  }))

  // 차트 3: Sankey — 가장 최근 시즌 1개
  const latest = sorted[sorted.length - 1]
  const sankeySection = (() => {
    if (!latest) return null

    const tcktRev = latest.tcktRev ?? 0
    const bcstRev = latest.bcstRev ?? 0
    const spnsRev = latest.spnsRev ?? 0
    const totalRev = tcktRev + bcstRev + spnsRev
    const plrSalCost = latest.plrSalCost ?? 0
    const stffCost = latest.stffCost ?? 0
    const oprCost = latest.oprCost ?? 0

    if (totalRev === 0) {
      return (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
          Sankey 표시를 위한 데이터가 부족합니다.
        </Typography>
      )
    }

    const sankeyData = {
      nodes: [
        { name: '수입 총계' },
        { name: '입장수익' },
        { name: '방송수익' },
        { name: '스폰서수익' },
        { name: '선수단연봉' },
        { name: '스태프비용' },
        { name: '운영비' },
      ],
      links: [
        ...(tcktRev > 0 ? [{ source: 1, target: 0, value: tcktRev }] : []),
        ...(bcstRev > 0 ? [{ source: 2, target: 0, value: bcstRev }] : []),
        ...(spnsRev > 0 ? [{ source: 3, target: 0, value: spnsRev }] : []),
        ...(plrSalCost > 0 ? [{ source: 0, target: 4, value: plrSalCost }] : []),
        ...(stffCost > 0 ? [{ source: 0, target: 5, value: stffCost }] : []),
        ...(oprCost > 0 ? [{ source: 0, target: 6, value: oprCost }] : []),
      ],
    }

    // 링크가 부족하면 BarChart로 대체
    if (sankeyData.links.length < 2) {
      const barData = [
        { name: '입장수익', value: tcktRev },
        { name: '방송수익', value: bcstRev },
        { name: '스폰서수익', value: spnsRev },
        { name: '선수단연봉', value: plrSalCost },
        { name: '스태프비용', value: stffCost },
        { name: '운영비', value: oprCost },
      ]
      return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={yTickFmt} tick={{ fontSize: 11 }} width={52} />
            <RechartsTooltip formatter={tooltipFmt} />
            <Bar dataKey="value" fill={ciClr} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    return (
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          {latest.ssntYr}시즌 수입·지출 흐름 (단위: 만원)
        </Typography>
        <ResponsiveContainer width="100%" height={320}>
          <Sankey
            data={sankeyData}
            nodePadding={20}
            nodeWidth={12}
            margin={{ top: 10, right: 160, bottom: 10, left: 160 }}
            link={{ stroke: '#aaa', fill: '#aaa', fillOpacity: 0.25 }}
            node={{ fill: ciClr, stroke: ciClr }}
          >
            <RechartsTooltip formatter={(value: unknown) => [`${Number(value).toLocaleString()}만원`]} />
          </Sankey>
        </ResponsiveContainer>
      </Box>
    )
  })()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 차트 1: 수입·지출 추이 (꺾은선) */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>수입·지출 추이</Typography>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={incomeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={yTickFmt} tick={{ fontSize: 11 }} width={52} />
            <RechartsTooltip formatter={tooltipFmt} />
            <Legend />
            <Line type="monotone" dataKey="입장수익" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="방송수익" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="스폰서수익" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Divider />
      {/* 차트 2: 수입 구성 (누적 면적) */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>수입 구성 (누적)</Typography>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={incomeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={yTickFmt} tick={{ fontSize: 11 }} width={52} />
            <RechartsTooltip formatter={tooltipFmt} />
            <Legend />
            <Area type="monotone" dataKey="입장수익" stackId="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="방송수익" stackId="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
            <Area type="monotone" dataKey="스폰서수익" stackId="revenue" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      <Divider />
      {/* 차트 3: 종합 수입·지출 흐름 (Sankey) */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>종합 수입·지출 흐름</Typography>
        {sankeySection}
      </Box>
    </Box>
  )
}
