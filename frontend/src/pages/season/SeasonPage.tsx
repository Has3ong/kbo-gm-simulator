import {
  Box, Typography, Paper, Divider, CircularProgress,
  Chip, Stack, Button, Alert, Tooltip, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Pagination,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import FastForwardIcon from '@mui/icons-material/FastForward'
import GroupsIcon from '@mui/icons-material/Groups'
import BeachAccessIcon from '@mui/icons-material/BeachAccess'
import PublicIcon from '@mui/icons-material/Public'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import BugReportIcon from '@mui/icons-material/BugReport'
import { useSeasonPage } from './SeasonPageHooks'
import type { BrdcstSpnsr } from '../../types/broadcast'
import { formatSalary } from '../../utils/format'
import { teamLogoSrc } from '../../constants'
import EventProgressDialog from '../../components/EventProgressDialog'
import StaffHireModal from '../../components/StaffHireModal'
import SpringCampModal from '../../components/SpringCampModal'
import ForeignPlayerModal from '../../components/ForeignPlayerModal'
import GrowthDetailTable from '../../components/GrowthDetailTable'

const EVENT_TYPE_LABELS: Record<string, string> = {
  INJ: '부상', RCV: '회복', TRD: '트레이드', SIGN: '계약', REL: '방출',
  WARN: '경고', FAN: '팬반응', CALL: '콜업', MVP: 'MVP', POST: '포스트',
  REC: '기록', NEWS: '뉴스', BRDCST: '방송국계약', STFF: '스태프선임',
  GRWTH: '성장', RCNF: '로스터확정', FRGN_OVER: '외국인초과', STFF_AI: '타 구단 선임',
  FRGN: '외국인계약', SPRNG: '스프링캠프', FRGN_OPEN: '용병계약시작',
}

const EVENT_CHIP_COLOR: Record<string, 'default' | 'error' | 'success' | 'info' | 'warning' | 'primary' | 'secondary'> = {
  INJ: 'error', RCV: 'success', TRD: 'info', SIGN: 'primary',
  REL: 'default', MVP: 'warning', POST: 'secondary', BRDCST: 'warning', STFF: 'warning',
  GRWTH: 'success', RCNF: 'warning', FRGN_OVER: 'error', STFF_AI: 'primary',
  FRGN: 'primary', SPRNG: 'info', FRGN_OPEN: 'secondary',
}

const GAME_SIM_STEP_LABELS = [
  '경기 목록 조회 및 준비',
  '경기 점수 시뮬레이션',
  '선수 경기 기록 저장',
  '팀 순위 갱신',
  '선수 피로도·컨디션 반영',
  '구단 재정 반영',
  '경기 이벤트 생성',
  '경기 처리 완료',
]

const MONTHLY_STEP_LABELS = [
  '전월 팀 성적 정리',
  '전월 선수 기록 정리',
  '월간 MVP 선정',
  '구단 월간 수익·비용 정산',
  '팬·구단주 만족도 갱신',
  '월간 리포트 생성',
]

const WEEKLY_STEP_LABELS = [
  '지난 주 성적 요약',
  '선수 피로도·컨디션 회복',
  '부상 선수 회복 상태 갱신',
  '로스터 문제 점검',
  '선발 로테이션 정리',
  '불펜 피로도 점검',
  'AI 구단 로스터 자동 조정',
  '트레이드 시장 관심도 갱신',
  '스카우팅 진행도 갱신',
  '주간 리포트 생성',
]

const SEASON_END_STEP_LABELS = [
  '시즌 종료 조건 확인',
  '최종 순위 확정',
  '시즌 챔피언 결정',
  '시즌 기록 확정',
  '골든글러브 선정',
  '시즌 MVP 선정',
  '팬·구단주 최종 평가',
  '구단 재정 최종 정산',
  '선수 성장·노화 처리',
  '계약 만료·FA 전환',
  '은퇴 선수 처리',
  '드래프트 일정 준비',
  '오프시즌 전환',
  '시즌 최종 리포트 생성',
]

const STATION_COLORS: Record<string, string> = {
  SBS: '#2563EB', KBS: '#DC2626', MBC: '#16A34A',
}

export default function SeasonPage() {
  const navigate = useNavigate()
  const [confirmBrdcst, setConfirmBrdcst] = useState<BrdcstSpnsr | null>(null)
  const {
    season, events, eventsPage, setEventsPage, eventsTotalPages, eventsTotalElements, PAGE_SIZE,
    isLoading, reloadEventsMutation, ssntYr,
    userTmId, userTeamMeta, userStanding,
    selectedEvntId, setSelectedEvntId, selectedEvent, handleSelectEvent,
    advanceCheck, advanceMutation, handleAdvance,
    SSNT_STTS_LABEL,
    gameSimOpen, gameSimProgress, handleSimulateGames, closeGameSim,
    monthlyOpen, monthlyProgress, closeMonthly,
    weeklyOpen, weeklyProgress, closeWeekly,
    seasonEndOpen, seasonEndProgress, closeSeasonEnd,
    advanceWeekOpen, advanceWeekProgress, handleAdvanceWeek, closeAdvanceWeek,
    staffHireOpen, openStaffHire, handleStaffHired, setStaffHireOpen,
    springCampOpen, openSpringCamp, handleSpringCampSelected, setSpringCampOpen,
    frgnPlrOpen, openFrgnPlr, setFrgnPlrOpen,
    brdcstOptions, selectBrdcstMutation,
  } = useSeasonPage()

  const canAdvance = advanceCheck?.canAdvance ?? false
  const incompleteGames = advanceCheck?.incompleteGamesCount ?? 0
  const broadcasterSelected = advanceCheck?.broadcasterSelected ?? false
  const stffHired = advanceCheck?.stffHired ?? false
  const springCampDone = advanceCheck?.springCampDone ?? false
  const springCampRequired = advanceCheck?.springCampRequired ?? false
  const rosterConfirmed = advanceCheck?.rosterConfirmed ?? false
  const frgnPlrExceeded = advanceCheck?.frgnPlrExceeded ?? false
  const isPre = season?.ssntSttsCd === 'PRE'
  const currentDateStr = advanceCheck?.currentDate ?? ''
  const isInFrgnPeriod = isPre &&
    currentDateStr >= `${ssntYr}-02-01` && currentDateStr <= `${ssntYr}-02-10`

  // PRE 시즌 필수 이벤트 게이트 툴팁
  const advanceTooltip = frgnPlrExceeded
    ? '외국인 선수가 3명을 초과했습니다. 로스터 확정 화면에서 조정해주세요'
    : !broadcasterSelected
      ? '방송국 스폰서를 먼저 선택해주세요'
      : isPre && !stffHired
        ? '감독·코치를 먼저 선임해주세요'
        : isPre && springCampRequired && !springCampDone
          ? '스프링 캠프를 먼저 선택해주세요'
          : isPre && !rosterConfirmed
            ? '로스터를 먼저 확정해주세요'
            : incompleteGames > 0
              ? '오늘 경기를 모두 완료해주세요'
              : '다음 날짜로 진행합니다'

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{ssntYr}시즌</Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* PRE 시즌 필수 이벤트 버튼들 */}
          {isPre && broadcasterSelected && !stffHired && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<GroupsIcon />}
              onClick={openStaffHire}
            >
              감독·코치 선임하기
            </Button>
          )}
          {isInFrgnPeriod && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<PublicIcon />}
              onClick={openFrgnPlr}
            >
              외국인 계약
            </Button>
          )}
          {isPre && springCampDone && !rosterConfirmed && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AssignmentTurnedInIcon />}
              onClick={() => navigate('/roster-confirm')}
            >
              로스터 확정
            </Button>
          )}

          {incompleteGames > 0 && (
            <Tooltip title={`오늘 ${incompleteGames}경기 시뮬레이션`} arrow>
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrowIcon />}
                onClick={handleSimulateGames}
                disabled={gameSimOpen}
              >
                경기 시작하기
              </Button>
            </Tooltip>
          )}

          <Tooltip title={advanceTooltip} arrow>
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SkipNextIcon />}
                disabled={!canAdvance || advanceMutation.isPending}
                onClick={handleAdvance}
              >
                진행하기
              </Button>
            </span>
          </Tooltip>

          <Tooltip
            title={
              !canAdvance
                ? advanceTooltip
                : '다음주 월요일까지 자동으로 진행합니다'
            }
            arrow
          >
            <span>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FastForwardIcon />}
                disabled={!canAdvance || advanceWeekOpen}
                onClick={handleAdvanceWeek}
              >
                다음주까지 진행하기
              </Button>
            </span>
          </Tooltip>

          <Button
            variant="text"
            size="small"
            component={Link}
            to="/dev"
            startIcon={<BugReportIcon />}
            sx={{ color: 'text.disabled', fontSize: 11, textTransform: 'none', minWidth: 'unset' }}
          >
            DEV
          </Button>
        </Box>
      </Box>

      {userTmId && (
        <Paper
          variant="outlined"
          sx={{
            mb: 3, p: 2,
            borderLeft: `4px solid ${userTeamMeta?.ciClr ?? '#1976d2'}`,
            display: 'flex', alignItems: 'center', gap: 2.5,
          }}
        >
          {teamLogoSrc(userTmId) && (
            <Box
              component="img"
              src={teamLogoSrc(userTmId)}
              alt={userTeamMeta?.tmKrNm ?? ''}
              sx={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0 }}
            />
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {userTeamMeta?.tmKrNm ?? '-'}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
              {userStanding ? (
                <>
                  <Chip
                    label={`${userStanding.stndRnk ?? '-'}위`}
                    size="small"
                    sx={{ fontWeight: 'bold', bgcolor: userTeamMeta?.ciClr ?? 'primary.main', color: '#fff', height: 22 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {userStanding.w}승 {userStanding.l}패
                    {userStanding.t > 0 ? ` ${userStanding.t}무` : ''}
                  </Typography>
                  {userStanding.gb != null && userStanding.gb > 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {userStanding.gb}게임차
                    </Typography>
                  )}
                  {userStanding.strkType && userStanding.strkCnt != null && (
                    <Chip
                      label={`${userStanding.strkType === 'W' ? '연승' : '연패'} ${userStanding.strkCnt}`}
                      size="small"
                      color={userStanding.strkType === 'W' ? 'success' : 'error'}
                      sx={{ height: 20, fontSize: 11 }}
                    />
                  )}
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  시즌 전
                </Typography>
              )}
            </Stack>
          </Box>
        </Paper>
      )}

      {season && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <InfoItem label="상태" value={SSNT_STTS_LABEL[season.ssntSttsCd ?? ''] ?? '-'} />
          <InfoItem label="현재 날짜" value={season.curDt ?? '-'} />
          <InfoItem label="정규시즌 개막" value={season.regSsntBgngDt ?? '-'} />
          <InfoItem label="정규시즌 종료" value={season.regSsntEndDt ?? '-'} />
          <InfoItem label="포스트시즌 시작" value={season.pstssntBgngDt ?? '-'} />
        </Paper>
      )}

      {advanceMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(advanceMutation.error as Error)?.message ?? '날짜 진행에 실패했습니다.'}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>시즌 이벤트 / 뉴스</Typography>
        <Tooltip title="뉴스 새로고침" arrow>
          <span>
            <IconButton
              size="small"
              onClick={() => reloadEventsMutation.mutate()}
              disabled={reloadEventsMutation.isPending}
            >
              <RefreshIcon
                fontSize="small"
                sx={{
                  animation: reloadEventsMutation.isPending ? 'spin 0.7s linear infinite' : 'none',
                  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                }}
              />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, minHeight: 500 }}>
          {/* 좌측: 뉴스 목록 */}
          <Box sx={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Paper variant="outlined" sx={{ overflow: 'auto', maxHeight: 640 }}>
            {events.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', p: 2 }}>이벤트가 없습니다.</Typography>
            ) : (
              events.map((e) => {
                const isUnread = e.rdYn === '0'
                const isSelected = e.evntId === selectedEvntId
                const isPriority =
                  (e.evntTypeCd === 'BRDCST' && e.evntCnts?.startsWith('<') && !broadcasterSelected) ||
                  (e.evntTypeCd === 'STFF' && !stffHired) ||
                  (e.evntTypeCd === 'SPRNG' && springCampRequired && !springCampDone)
                return (
                  <Box
                    key={e.evntId}
                    onClick={() => handleSelectEvent(e.evntId)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: isSelected
                        ? 'rgba(25,118,210,0.08)'
                        : isPriority
                          ? 'rgba(237,108,2,0.12)'
                          : isUnread
                            ? 'rgba(237,108,2,0.04)'
                            : 'background.paper',
                      '&:hover': { bgcolor: isSelected ? 'rgba(25,118,210,0.08)' : 'action.hover' },
                      borderLeft: isSelected ? '3px solid' : isPriority ? '3px solid' : '3px solid transparent',
                      borderLeftColor: isSelected ? 'primary.main' : isPriority ? 'warning.main' : 'transparent',
                    }}
                  >
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>{e.evntDt}</Typography>
                      <Chip
                        label={e.evntTypeNm ?? EVENT_TYPE_LABELS[e.evntTypeCd] ?? e.evntTypeCd}
                        size="small"
                        color={EVENT_CHIP_COLOR[e.evntTypeCd] ?? 'default'}
                        sx={{ height: 16, fontSize: 10, '& .MuiChip-label': { px: 0.5 } }}
                      />
                      {isPriority && (
                        <Chip label="필수" size="small" color="error" sx={{ height: 14, fontSize: 9, '& .MuiChip-label': { px: 0.5 } }} />
                      )}
                      {isUnread && !isPriority && (
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }} />
                      )}
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isUnread || isPriority ? 'bold' : 'normal',
                        fontSize: 13,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: isPriority ? 'warning.dark' : 'inherit',
                      }}
                    >
                      {e.evntTtlt}
                    </Typography>
                    {e.tmKrNm && (
                      <Typography variant="caption" sx={{ color: 'secondary.main', fontSize: 11 }}>{e.tmKrNm}</Typography>
                    )}
                  </Box>
                )
              })
            )}
          </Paper>

          {eventsTotalPages > 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Pagination
                count={eventsTotalPages}
                page={eventsPage + 1}
                onChange={(_, p) => {
                  setEventsPage(p - 1)
                  setSelectedEvntId(null)
                }}
                size="small"
                siblingCount={0}
                boundaryCount={1}
              />
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                총 {eventsTotalElements}개 · {PAGE_SIZE}개씩 보기
              </Typography>
            </Box>
          )}
          </Box>

          {/* 중앙: 뉴스 상세 */}
          <Paper variant="outlined" sx={{ flex: 1, p: 3 }}>
            {selectedEvent ? (
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{selectedEvent.evntDt}</Typography>
                  <Chip
                    label={selectedEvent.evntTypeNm ?? EVENT_TYPE_LABELS[selectedEvent.evntTypeCd] ?? selectedEvent.evntTypeCd}
                    size="small"
                    color={EVENT_CHIP_COLOR[selectedEvent.evntTypeCd] ?? 'default'}
                  />
                  {selectedEvent.tmKrNm && (
                    <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'medium' }}>{selectedEvent.tmKrNm}</Typography>
                  )}
                  {selectedEvent.plrNm && (
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{selectedEvent.plrNm}</Typography>
                  )}
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>{selectedEvent.evntTtlt}</Typography>
                <Divider sx={{ mb: 2 }} />
                {selectedEvent.evntTypeCd === 'GRWTH' ? (
                  <GrowthDetailTable ssntYr={ssntYr} />
                ) : selectedEvent.evntTypeCd === 'RCNF' ? (
                  <Box>
                    {selectedEvent.evntCnts && (
                      <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.8, mb: 2 }}>
                        {selectedEvent.evntCnts}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AssignmentTurnedInIcon />}
                      onClick={() => navigate('/roster-confirm')}
                    >
                      로스터 확정하러 가기
                    </Button>
                  </Box>
                ) : selectedEvent.evntTypeCd === 'FRGN_OVER' ? (
                  <Box>
                    {selectedEvent.evntCnts && (
                      <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.8, mb: 2 }}>
                        {selectedEvent.evntCnts}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<AssignmentTurnedInIcon />}
                      onClick={() => navigate('/roster-confirm')}
                    >
                      로스터 확정하러 가기
                    </Button>
                  </Box>
                ) : selectedEvent.evntTypeCd === 'FRGN_OPEN' ? (
                  <Box>
                    {selectedEvent.evntCnts && (
                      <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.8, mb: 2 }}>
                        {selectedEvent.evntCnts}
                      </Typography>
                    )}
                    {isInFrgnPeriod ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<PublicIcon />}
                        onClick={openFrgnPlr}
                      >
                        외국인 용병 계약하기
                      </Button>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                        외국인 용병 계약 기간이 종료되었습니다.
                      </Typography>
                    )}
                  </Box>
                ) : selectedEvent.evntTypeCd === 'SPRNG' ? (
                  <Box>
                    {selectedEvent.evntCnts && (
                      <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.8, mb: 2 }}>
                        {selectedEvent.evntCnts}
                      </Typography>
                    )}
                    {!springCampDone && (
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<BeachAccessIcon />}
                        onClick={openSpringCamp}
                      >
                        스프링 캠프 선택하기
                      </Button>
                    )}
                  </Box>
                ) : selectedEvent.evntTypeCd === 'STFF_AI' && selectedEvent.evntCnts ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'action.hover' } }}>
                        <TableCell>구단</TableCell>
                        <TableCell>감독</TableCell>
                        <TableCell>코치 1</TableCell>
                        <TableCell>코치 2</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedEvent.evntCnts.split('\n').filter(Boolean).map((row, i) => {
                        const [tmNm, mgr, coach1, coach2] = row.split('|')
                        return (
                          <TableRow key={i}>
                            <TableCell sx={{ fontWeight: 'medium' }}>{tmNm}</TableCell>
                            <TableCell>{mgr}</TableCell>
                            <TableCell>{coach1}</TableCell>
                            <TableCell>{coach2}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : selectedEvent.evntTypeCd === 'STFF' ? (
                  <Box>
                    {selectedEvent.evntCnts?.startsWith('<') ? (
                      <Box
                        dangerouslySetInnerHTML={{ __html: selectedEvent.evntCnts }}
                        sx={{ mb: 2, '& ul': { color: 'text.secondary' } }}
                      />
                    ) : selectedEvent.evntCnts ? (
                      <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.8, mb: 2 }}>
                        {selectedEvent.evntCnts}
                      </Typography>
                    ) : null}
                    {!stffHired && (
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<GroupsIcon />}
                        onClick={openStaffHire}
                      >
                        감독·코치 선임하기
                      </Button>
                    )}
                  </Box>
                ) : selectedEvent.evntTypeCd === 'BRDCST' && selectedEvent.evntCnts?.startsWith('<') && !broadcasterSelected ? (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      계약금이 높을수록 안정적이지만 성과 수당이 낮습니다. 시즌 중 변경 불가합니다.
                    </Typography>
                    <Grid container spacing={2}>
                      {brdcstOptions.map((opt) => {
                        const color = STATION_COLORS[opt.brdcstCd] ?? '#555'
                        return (
                          <Grid size={{ xs: 12, sm: 4 }} key={opt.brdcstCd}>
                            <Paper
                              elevation={2}
                              sx={{ p: 2, borderTop: `4px solid ${color}`, '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.15s' }}
                            >
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color, mb: 1 }}>{opt.brdcstNm}</Typography>
                              <Divider sx={{ mb: 1 }} />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>계약금</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{formatSalary(opt.cntrctFee).display}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>승리 수당</Typography>
                                <Typography variant="caption">{opt.winBonus.toLocaleString()}만/승</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>포스트 수당</Typography>
                                <Typography variant="caption">{formatSalary(opt.postBonus).display}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>우승 수당</Typography>
                                <Typography variant="caption">{formatSalary(opt.ksBonus).display}</Typography>
                              </Box>
                              <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                sx={{ mt: 1.5, bgcolor: color, '&:hover': { bgcolor: color, opacity: 0.9 } }}
                                onClick={() => setConfirmBrdcst(opt)}
                              >
                                선택
                              </Button>
                            </Paper>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Box>
                ) : selectedEvent.evntCnts?.startsWith('<') ? (
                  <Box
                    dangerouslySetInnerHTML={{ __html: selectedEvent.evntCnts }}
                    sx={{ '& table': { borderCollapse: 'collapse' }, '& th,& td': { fontFamily: 'inherit' } }}
                  />
                ) : selectedEvent.evntCnts ? (
                  <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {selectedEvent.evntCnts}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>상세 내용이 없습니다.</Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  좌측 뉴스를 선택하면 상세 내용을 볼 수 있습니다.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* 이벤트 진행 다이얼로그 */}
      <EventProgressDialog
        open={gameSimOpen}
        title={`${ssntYr}년 경기 처리 중...`}
        stepLabels={GAME_SIM_STEP_LABELS}
        progress={gameSimProgress}
        onClose={closeGameSim}
      />

      <EventProgressDialog
        open={monthlyOpen}
        title="월간 정산 처리 중..."
        stepLabels={MONTHLY_STEP_LABELS}
        progress={monthlyProgress}
        onClose={closeMonthly}
      />

      <EventProgressDialog
        open={weeklyOpen}
        title="주간 처리 중..."
        stepLabels={WEEKLY_STEP_LABELS}
        progress={weeklyProgress}
        onClose={closeWeekly}
      />

      <EventProgressDialog
        open={seasonEndOpen}
        title={`${ssntYr}년 시즌 종료 처리 중...`}
        stepLabels={SEASON_END_STEP_LABELS}
        progress={seasonEndProgress}
        onClose={closeSeasonEnd}
      />

      <EventProgressDialog
        open={advanceWeekOpen}
        title="다음주 월요일까지 진행 중..."
        stepLabels={[]}
        progress={advanceWeekProgress}
        onClose={closeAdvanceWeek}
      />

      {/* 감독·코치 선임 모달 */}
      <StaffHireModal
        open={staffHireOpen}
        onClose={() => setStaffHireOpen(false)}
        onHired={handleStaffHired}
      />

      {/* 스프링 캠프 선택 모달 */}
      <SpringCampModal
        open={springCampOpen}
        onClose={() => setSpringCampOpen(false)}
        onSelected={handleSpringCampSelected}
      />

      {/* 외국인 선수 계약 모달 */}
      <ForeignPlayerModal
        open={frgnPlrOpen}
        onClose={() => setFrgnPlrOpen(false)}
        ssntYr={ssntYr}
      />

      {/* 방송국 선택 확정 다이얼로그 */}
      <Dialog open={!!confirmBrdcst} onClose={() => setConfirmBrdcst(null)} maxWidth="xs" fullWidth>
        <DialogTitle>스폰서 계약 확정</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{confirmBrdcst?.brdcstNm}</strong>과 스폰서 계약을 체결하시겠습니까?<br />
            계약금 <strong>{confirmBrdcst ? formatSalary(confirmBrdcst.cntrctFee).display : ''}</strong>가 즉시 지급됩니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBrdcst(null)}>취소</Button>
          <Button
            variant="contained"
            disabled={selectBrdcstMutation.isPending}
            onClick={() => {
              if (!confirmBrdcst) return
              selectBrdcstMutation.mutate(confirmBrdcst.brdcstCd, {
                onSuccess: () => setConfirmBrdcst(null),
              })
            }}
          >
            확정
          </Button>
        </DialogActions>
      </Dialog>
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
