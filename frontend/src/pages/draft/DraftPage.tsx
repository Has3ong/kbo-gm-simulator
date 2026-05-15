import { useState } from 'react'
import {
  Box, Typography, Paper, Button, Chip, CircularProgress, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Tabs, Tab, Divider, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material'
import FastForwardIcon from '@mui/icons-material/FastForward'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { useDraftPage } from './DraftPageHooks'
import type { DraftPlayer } from '../../types/draft'
import { ABILITY_GRADE_COLOR } from '../../constants'

const DRFT_STTS_LABEL: Record<string, string> = {
  CREATED: '생성됨', SCOUTING: '스카우팅 중', READY: '준비 완료',
  IN_PROGRESS: '진행 중', COMPLETED: '완료',
}

const GRWTH_TEND_LABEL: Record<string, string> = {
  ERLY: '조기 성장', LATB: '만개형', NRML: '일반',
}

function GradeChip({ grade }: { grade: string | null }) {
  if (!grade) return <span>-</span>
  return (
    <Chip
      label={grade}
      size="small"
      sx={{
        bgcolor: ABILITY_GRADE_COLOR[grade] ?? '#9CA3AF',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 11,
        height: 20,
        '& .MuiChip-label': { px: 0.75 },
      }}
    />
  )
}

function InjRskChip({ val }: { val: number | null }) {
  if (val == null) return <span>-</span>
  const color = val >= 14 ? 'error' : val >= 9 ? 'warning' : 'success'
  return <Chip label={val} size="small" color={color} sx={{ fontWeight: 'bold', height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.5 } }} />
}

export default function DraftPage() {
  const {
    draft, players, order, isLoading, error,
    ssntYr, userTmId,
    createDraft, generatePool, startDraft,
    pickMutation, simulateMutation,
    tab, setTab,
    selectedPlayer, setSelectedPlayer,
  } = useDraftPage()

  const [pickConfirmOpen, setPickConfirmOpen] = useState(false)

  const isMyPick = draft && order
    ? order.find(o => o.pickNo === draft.currentPickNo)?.tmId === userTmId
    : false

  const pickedIds = new Set((order ?? []).filter(o => o.pickSttsCd === 'PICKED').map(o => o.drftPlrId))

  function handlePick(plr: DraftPlayer) {
    setSelectedPlayer(plr)
    setPickConfirmOpen(true)
  }

  function confirmPick() {
    if (!selectedPlayer || !draft) return
    pickMutation.mutate({ userTmId, drftPlrId: selectedPlayer.drftPlrId }, {
      onSuccess: () => setPickConfirmOpen(false),
    })
  }

  function handleSimulate() {
    if (!draft) return
    simulateMutation.mutate(userTmId)
  }

  function renderSchool(p: DraftPlayer) {
    if (p.univNm) return p.univNm
    if (p.hsNm) return p.hsNm
    return p.plrOrgnNm ?? '-'
  }

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  if (error || !draft) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>드래프트</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          {ssntYr}년 드래프트가 아직 생성되지 않았습니다.
        </Alert>
        <Button variant="contained" onClick={() => createDraft.mutate(userTmId)} disabled={createDraft.isPending}>
          {createDraft.isPending ? <CircularProgress size={20} /> : `${ssntYr}년 드래프트 생성`}
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{ssntYr}년 드래프트</Typography>
          <Chip
            label={DRFT_STTS_LABEL[draft.drftSttsCd] ?? draft.drftSttsCd}
            color={draft.drftSttsCd === 'IN_PROGRESS' ? 'success' : draft.drftSttsCd === 'COMPLETED' ? 'default' : 'primary'}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {draft.drftSttsCd === 'CREATED' && (
            <Button variant="contained" color="info"
              onClick={() => generatePool.mutate({ drftId: draft.drftId, userTmId })}
              disabled={generatePool.isPending}>
              {generatePool.isPending ? <CircularProgress size={20} /> : '선수 풀 생성'}
            </Button>
          )}
          {(draft.drftSttsCd === 'SCOUTING' || draft.drftSttsCd === 'READY') && (
            <Button variant="contained" color="success"
              onClick={() => startDraft.mutate({ drftId: draft.drftId, userTmId })}
              disabled={startDraft.isPending}>
              드래프트 시작
            </Button>
          )}
          {draft.drftSttsCd === 'IN_PROGRESS' && !isMyPick && (
            <Button variant="contained" color="primary" startIcon={<FastForwardIcon />}
              onClick={handleSimulate} disabled={simulateMutation.isPending}>
              {simulateMutation.isPending ? <CircularProgress size={20} /> : '내 픽까지 AI 진행'}
            </Button>
          )}
        </Box>
      </Box>

      {/* 진행 현황 */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box><Typography variant="caption" color="text.secondary">총 지명</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>{draft.totalPicked} / {draft.maxPickCnt}</Typography></Box>
        <Box><Typography variant="caption" color="text.secondary">내 지명</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>{draft.myPickCnt} / {draft.rndCnt}</Typography></Box>
        {draft.currentPickNo && (
          <Box><Typography variant="caption" color="text.secondary">현재 픽</Typography>
            <Typography sx={{ fontWeight: 'bold', color: isMyPick ? 'success.main' : 'inherit' }}>
              #{draft.currentPickNo} {isMyPick && '← 내 차례!'}
            </Typography></Box>
        )}
      </Paper>

      {isMyPick && (
        <Alert severity="success" sx={{ mb: 2, fontWeight: 'bold' }}>
          지금은 내 팀의 픽 차례입니다! 아래 선수 목록에서 지명할 선수를 선택하세요.
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label="선수 풀" value="players" />
        <Tab label="지명 순서" value="order" />
      </Tabs>

      {/* 선수 풀 탭 */}
      {tab === 'players' && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' } }}>
                <TableCell>이름</TableCell>
                <TableCell align="center">나이</TableCell>
                <TableCell>포지션</TableCell>
                <TableCell>투타</TableCell>
                <TableCell>출신교</TableCell>
                <TableCell align="center">신체</TableCell>
                <TableCell>주요기록</TableCell>
                <TableCell align="center">현능력</TableCell>
                <TableCell align="center">잠재력</TableCell>
                <TableCell align="center">등급</TableCell>
                <TableCell align="center">예상라운드</TableCell>
                <TableCell align="center">성장성향</TableCell>
                <TableCell align="center">부상위험</TableCell>
                <TableCell>스카우트 코멘트</TableCell>
                {draft.drftSttsCd === 'IN_PROGRESS' && isMyPick && <TableCell align="center">지명</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {(players ?? [])
                .filter(p => p.isPickYn !== 'Y')
                .map((p) => {
                  const isPicked = pickedIds.has(p.drftPlrId)
                  return (
                    <TableRow
                      key={p.drftPlrId}
                      hover={!isPicked}
                      sx={{ opacity: isPicked ? 0.4 : 1, bgcolor: p.prioOrd != null ? 'rgba(25,118,210,0.04)' : 'inherit' }}
                    >
                      <TableCell sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Tooltip title={p.cmnt ?? ''} placement="right">
                            <span style={{ cursor: 'default' }}>{p.plrNm}</span>
                          </Tooltip>
                          {p.prioOrd != null && (
                            <Tooltip title={`보드 우선순위: ${p.prioOrd}`}>
                              <BookmarkIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{p.plrAge}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{p.posnNm ?? p.posnCd}</TableCell>
                      <TableCell>{p.plrBatPtchHandCd ?? '-'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{renderSchool(p)}</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                        {p.plrHt && p.plrWt ? `${p.plrHt}cm / ${p.plrWt}kg` : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap', maxWidth: 160 }}>
                        {p.prevRec ?? '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                          <Typography variant="body2">{p.estOvrlAblt ?? '-'}</Typography>
                          <GradeChip grade={p.estOvrlGrade} />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                          <Typography variant="body2">{p.estPotAblt ?? '-'}</Typography>
                          <GradeChip grade={p.estPotGrade} />
                        </Box>
                      </TableCell>
                      <TableCell align="center"><GradeChip grade={p.grade} /></TableCell>
                      <TableCell align="center">{p.estRnd ? `${p.estRnd}라운드` : '-'}</TableCell>
                      <TableCell align="center" sx={{ fontSize: 11 }}>
                        {p.grwthTend ? GRWTH_TEND_LABEL[p.grwthTend] ?? p.grwthTend : '-'}
                      </TableCell>
                      <TableCell align="center"><InjRskChip val={p.injRsk} /></TableCell>
                      <TableCell sx={{ fontSize: 11, color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.cmnt ?? '-'}
                      </TableCell>
                      {draft.drftSttsCd === 'IN_PROGRESS' && isMyPick && (
                        <TableCell align="center">
                          <Button size="small" variant="outlined" color="success"
                            startIcon={<HowToVoteIcon />}
                            onClick={() => handlePick(p)}
                            disabled={isPicked || pickMutation.isPending}>
                            지명
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 지명 순서 탭 */}
      {tab === 'order' && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.50' } }}>
                <TableCell align="center">픽</TableCell>
                <TableCell align="center">라운드</TableCell>
                <TableCell>구단</TableCell>
                <TableCell align="center">상태</TableCell>
                <TableCell>지명 선수</TableCell>
                <TableCell>포지션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(order ?? []).map((o) => {
                const isCurrent = o.pickNo === draft.currentPickNo
                const isUser = o.tmId === userTmId
                return (
                  <TableRow
                    key={o.pickNo}
                    sx={{
                      bgcolor: isCurrent ? 'rgba(46,125,50,0.08)' : isUser ? 'rgba(25,118,210,0.04)' : 'inherit',
                      fontWeight: isCurrent ? 'bold' : 'normal',
                    }}
                  >
                    <TableCell align="center" sx={{ fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? 'success.main' : 'inherit' }}>
                      {o.pickNo}
                    </TableCell>
                    <TableCell align="center">{o.rnd}</TableCell>
                    <TableCell sx={{ fontWeight: isUser ? 'bold' : 'normal', color: isUser ? 'primary.main' : 'inherit' }}>
                      {o.tmShrtKrNm ?? o.tmKrNm}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={o.pickSttsCd === 'PICKED' ? '지명' : o.pickSttsCd === 'SKIPPED' ? '패스' : isCurrent ? '진행중' : '대기'}
                        size="small"
                        color={o.pickSttsCd === 'PICKED' ? 'success' : isCurrent ? 'warning' : 'default'}
                        sx={{ height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.5 } }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{o.plrNm ?? '-'}</TableCell>
                    <TableCell>{o.posnCd ?? '-'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 지명 확인 다이얼로그 */}
      <Dialog open={pickConfirmOpen} onClose={() => setPickConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>선수 지명 확인</DialogTitle>
        <DialogContent>
          {selectedPlayer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {selectedPlayer.plrNm} — {selectedPlayer.posnNm}
              </Typography>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Typography variant="body2">나이: {selectedPlayer.plrAge}세</Typography>
                <Typography variant="body2">투타: {selectedPlayer.plrBatPtchHandCd ?? '-'}</Typography>
                <Typography variant="body2">출신: {renderSchool(selectedPlayer)}</Typography>
                <Typography variant="body2">신체: {selectedPlayer.plrHt && selectedPlayer.plrWt ? `${selectedPlayer.plrHt}cm / ${selectedPlayer.plrWt}kg` : '-'}</Typography>
                <Typography variant="body2">주요기록: {selectedPlayer.prevRec ?? '-'}</Typography>
                <Typography variant="body2">성장성향: {selectedPlayer.grwthTend ? GRWTH_TEND_LABEL[selectedPlayer.grwthTend] ?? selectedPlayer.grwthTend : '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2">현능력:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedPlayer.estOvrlAblt ?? '-'}</Typography>
                  <GradeChip grade={selectedPlayer.estOvrlGrade} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2">잠재력:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedPlayer.estPotAblt ?? '-'}</Typography>
                  <GradeChip grade={selectedPlayer.estPotGrade} />
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {selectedPlayer.cmnt}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPickConfirmOpen(false)} color="inherit">취소</Button>
          <Button variant="contained" color="success" onClick={confirmPick} disabled={pickMutation.isPending}
            startIcon={pickMutation.isPending ? <CircularProgress size={16} /> : <HowToVoteIcon />}>
            지명 확정
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
