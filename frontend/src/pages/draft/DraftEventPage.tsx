import {
  Box, Typography, AppBar, Toolbar, Button, Chip,
  Drawer, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Alert, CircularProgress,
  Pagination, Divider, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GroupsIcon from '@mui/icons-material/Groups'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import FastForwardIcon from '@mui/icons-material/FastForward'
import { useNavigate } from 'react-router-dom'
import { useDraftEventPage } from './DraftEventPageHooks'
import { ABILITY_GRADE_COLOR } from '../../constants'
import type { DraftPlayer } from '../../types/draft'

const DRFT_STTS_LABEL: Record<string, string> = {
  CREATED: '생성됨', SCOUTING: '스카우팅 중', READY: '준비 완료',
  IN_PROGRESS: '진행 중', COMPLETED: '완료',
}

const GRWTH_TEND_LABEL: Record<string, string> = {
  ERLY: '조기 성장', LATB: '만개형', NRML: '일반',
}

const POSN_LABEL: Record<string, string> = {
  '10': '투수', '20': '포수', '21': '1루수', '22': '2루수', '23': '3루수',
  '24': '유격수', '25': '좌익수', '26': '중견수', '27': '우익수',
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
        fontSize: 10,
        height: 18,
        '& .MuiChip-label': { px: 0.5 },
      }}
    />
  )
}

function InjRskChip({ val }: { val: number | null }) {
  if (val == null) return <span>-</span>
  const color = val >= 14 ? 'error' : val >= 9 ? 'warning' : 'success'
  return <Chip label={val} size="small" color={color} sx={{ fontWeight: 'bold', height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.5 } }} />
}

function renderSchool(p: DraftPlayer) {
  if (p.univNm) return p.univNm
  if (p.hsNm) return p.hsNm
  return p.plrOrgnNm ?? '-'
}

export default function DraftEventPage() {
  const navigate = useNavigate()
  const {
    draft, isLoading, error,
    ssntYr, userTmId,
    rosterPlayers, rosterOpen, setRosterOpen,
    page, setPage, totalPages, pagedPlayers,
    pickedMap,
    teamPickList,
    isMyPick,
    selectedPlayer, pickConfirmOpen, openPickConfirm, closePickConfirm, confirmPick,
    createDraft, generatePool, startDraft,
    pickMutation, simulateMutation,
  } = useDraftEventPage()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', flexDirection: 'column' }}>
      {/* Custom AppBar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/season')}
            sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 'bold' }}
          >
            메인으로 돌아가기
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Button
            startIcon={<GroupsIcon />}
            onClick={() => setRosterOpen(true)}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            선수단
          </Button>

          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'inline' }}>
              {ssntYr}년 신인 드래프트
            </Typography>
            {draft && (
              <Chip
                label={DRFT_STTS_LABEL[draft.drftSttsCd] ?? draft.drftSttsCd}
                size="small"
                color={draft.drftSttsCd === 'IN_PROGRESS' ? 'success' : draft.drftSttsCd === 'COMPLETED' ? 'default' : 'primary'}
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          {/* Action buttons on the right */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {draft?.drftSttsCd === 'CREATED' && (
              <Button variant="contained" color="info" size="small"
                onClick={() => generatePool.mutate({ drftId: draft.drftId, userTmId })}
                disabled={generatePool.isPending}>
                {generatePool.isPending ? <CircularProgress size={16} /> : '선수 풀 생성'}
              </Button>
            )}
            {(draft?.drftSttsCd === 'SCOUTING' || draft?.drftSttsCd === 'READY') && (
              <Button variant="contained" color="success" size="small"
                onClick={() => startDraft.mutate({ drftId: draft.drftId, userTmId })}
                disabled={startDraft.isPending}>
                드래프트 시작
              </Button>
            )}
            {draft?.drftSttsCd === 'IN_PROGRESS' && !isMyPick && (
              <Button variant="contained" size="small" startIcon={<FastForwardIcon />}
                onClick={() => simulateMutation.mutate(userTmId)}
                disabled={simulateMutation.isPending}>
                {simulateMutation.isPending ? <CircularProgress size={16} /> : '내 픽까지 AI 진행'}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box sx={{ flex: 1, maxWidth: 1400, width: '100%', mx: 'auto', px: 3, py: 3 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && (error || !draft) && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              {ssntYr}년 드래프트가 아직 생성되지 않았습니다.
            </Alert>
            <Button variant="contained"
              onClick={() => createDraft.mutate(userTmId)}
              disabled={createDraft.isPending}>
              {createDraft.isPending ? <CircularProgress size={20} /> : `${ssntYr}년 드래프트 생성`}
            </Button>
          </Box>
        )}

        {!isLoading && draft && (
          <>
            {/* Progress stats */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">총 지명</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{draft.totalPicked} / {draft.maxPickCnt}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">내 지명</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{draft.myPickCnt} / {draft.rndCnt}</Typography>
              </Box>
              {draft.currentPickNo != null && (
                <Box>
                  <Typography variant="caption" color="text.secondary">현재 픽</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: isMyPick ? 'success.main' : 'inherit' }}>
                    #{draft.currentPickNo} {isMyPick && '← 내 차례!'}
                  </Typography>
                </Box>
              )}
            </Paper>

            {isMyPick && (
              <Alert severity="success" sx={{ mb: 2, fontWeight: 'bold' }}>
                지금은 내 팀의 픽 차례입니다! 아래 목록에서 지명할 선수를 선택하세요.
              </Alert>
            )}

            {/* Player list */}
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  드래프트 선수 목록
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    (잠재 능력치 순)
                  </Typography>
                </Typography>
              </Box>

              <TableContainer>
                <Table size="small" sx={{ minWidth: 1100 }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' } }}>
                      <TableCell align="center">#</TableCell>
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
                      <TableCell align="center">성장</TableCell>
                      <TableCell align="center">부상</TableCell>
                      <TableCell align="center">지명팀</TableCell>
                      {draft.drftSttsCd === 'IN_PROGRESS' && isMyPick && (
                        <TableCell align="center">지명</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedPlayers.map((p, idx) => {
                      const globalIdx = page * 20 + idx + 1
                      const pickInfo = pickedMap.get(p.drftPlrId)
                      const isPicked = p.isPickYn === 'Y'
                      return (
                        <TableRow
                          key={p.drftPlrId}
                          hover={!isPicked}
                          sx={{ opacity: isPicked ? 0.5 : 1 }}
                        >
                          <TableCell align="center" sx={{ color: 'text.secondary', fontSize: 12 }}>
                            {globalIdx}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                            {p.plrNm}
                          </TableCell>
                          <TableCell align="center">{p.plrAge}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                            {p.reprPosnNm ?? POSN_LABEL[p.reprPosnCd] ?? p.posnCd}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>{p.plrBatPtchHandCd ?? '-'}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>{renderSchool(p)}</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 11 }}>
                            {p.plrHt && p.plrWt ? `${p.plrHt}/${p.plrWt}` : '-'}
                          </TableCell>
                          <TableCell sx={{ fontSize: 11, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={p.prevRec ?? ''} placement="top">
                              <span>{p.prevRec ?? '-'}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                              <Typography variant="body2">{p.estOvrlAblt ?? '-'}</Typography>
                              <GradeChip grade={p.estOvrlGrade} />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{p.estPotAblt ?? '-'}</Typography>
                              <GradeChip grade={p.estPotGrade} />
                            </Box>
                          </TableCell>
                          <TableCell align="center"><GradeChip grade={p.grade} /></TableCell>
                          <TableCell align="center" sx={{ fontSize: 12 }}>
                            {p.estRnd ? `${p.estRnd}R` : '-'}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 11 }}>
                            {p.grwthTend ? GRWTH_TEND_LABEL[p.grwthTend] ?? p.grwthTend : '-'}
                          </TableCell>
                          <TableCell align="center"><InjRskChip val={p.injRsk} /></TableCell>
                          <TableCell align="center" sx={{ fontSize: 12 }}>
                            {pickInfo
                              ? <Chip label={`${pickInfo.tmKrNm} ${pickInfo.rnd}R`} size="small" color="success" sx={{ fontSize: 10, height: 18, '& .MuiChip-label': { px: 0.5 } }} />
                              : <Typography variant="caption" color="text.disabled">미지명</Typography>
                            }
                          </TableCell>
                          {draft.drftSttsCd === 'IN_PROGRESS' && isMyPick && (
                            <TableCell align="center">
                              {!isPicked && (
                                <Button size="small" variant="outlined" color="success"
                                  startIcon={<HowToVoteIcon />}
                                  onClick={() => openPickConfirm(p)}
                                  disabled={pickMutation.isPending}>
                                  지명
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                    {pagedPlayers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={20} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          표시할 선수가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={(_, v) => setPage(v - 1)}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </Paper>

            {/* Per-team picks */}
            {teamPickList.length > 0 && (
              <Paper variant="outlined">
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    구단별 지명 현황
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({draft.totalPicked}명 지명 완료)
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.50', whiteSpace: 'nowrap' } }}>
                        <TableCell align="center" sx={{ minWidth: 60 }}>라운드</TableCell>
                        {teamPickList.map(t => (
                          <TableCell
                            key={t.tmId}
                            align="center"
                            sx={{
                              minWidth: 100,
                              fontWeight: t.tmId === userTmId ? 'bold' : 'normal',
                              color: t.tmId === userTmId ? 'primary.main' : 'inherit',
                            }}
                          >
                            {t.tmKrNm}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.from({ length: draft.rndCnt }, (_, rndIdx) => {
                        const rnd = rndIdx + 1
                        return (
                          <TableRow key={rnd} hover>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 12 }}>
                              {rnd}R
                            </TableCell>
                            {teamPickList.map(t => {
                              const pick = t.picks?.find(p => p!.rnd === rnd)
                              return (
                                <TableCell
                                  key={t.tmId}
                                  align="center"
                                  sx={{
                                    fontSize: 12,
                                    bgcolor: t.tmId === userTmId ? 'rgba(25,118,210,0.04)' : 'inherit',
                                  }}
                                >
                                  {pick?.plrNm
                                    ? (
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: t.tmId === userTmId ? 'bold' : 'normal' }}>
                                          {pick.plrNm}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {pick.reprPosnCd ? POSN_LABEL[pick.reprPosnCd] ?? pick.reprPosnCd : pick.posnCd ?? '-'}
                                        </Typography>
                                      </Box>
                                    )
                                    : <Typography variant="caption" color="text.disabled">-</Typography>
                                  }
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* 선수단 Drawer */}
      <Drawer anchor="left" open={rosterOpen} onClose={() => setRosterOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>선수단 현황</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', fontSize: 12 } }}>
                <TableCell>이름</TableCell>
                <TableCell align="center">포지션</TableCell>
                <TableCell align="center">능력치</TableCell>
                <TableCell align="center">엔트리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rosterPlayers ?? [])
                .sort((a, b) => {
                  const posnOrder: Record<string, number> = { '10': 0, '20': 1, '21': 2, '22': 3, '23': 4, '24': 5, '25': 6, '26': 7, '27': 8 }
                  return (posnOrder[a.reprPosnCd ?? ''] ?? 9) - (posnOrder[b.reprPosnCd ?? ''] ?? 9)
                })
                .map(p => (
                  <TableRow key={p.plrId} hover>
                    <TableCell sx={{ fontWeight: 'medium', fontSize: 12 }}>{p.plrNm}</TableCell>
                    <TableCell align="center" sx={{ fontSize: 11 }}>
                      {p.reprPosnCd ? POSN_LABEL[p.reprPosnCd] ?? p.reprPosnCd : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                        <Typography variant="caption">{p.plrOvrlAblt ?? '-'}</Typography>
                        {p.ovrlGrade && <GradeChip grade={p.ovrlGrade} />}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: 11 }}>
                      <Chip
                        label={p.entyLvlCd === '1GUN' ? '1군' : p.entyLvlCd === '2GUN' ? '2군' : '-'}
                        size="small"
                        color={p.entyLvlCd === '1GUN' ? 'primary' : 'default'}
                        sx={{ height: 16, fontSize: 10, '& .MuiChip-label': { px: 0.4 } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      </Drawer>

      {/* Pick confirm dialog */}
      {selectedPlayer && (
        <Dialog open={pickConfirmOpen} onClose={closePickConfirm} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>선수 지명 확인</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {selectedPlayer.plrNm} — {selectedPlayer.reprPosnNm ?? POSN_LABEL[selectedPlayer.reprPosnCd] ?? selectedPlayer.posnCd}
              </Typography>
              <Divider />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Typography variant="body2">나이: {selectedPlayer.plrAge}세</Typography>
                <Typography variant="body2">투타: {selectedPlayer.plrBatPtchHandCd ?? '-'}</Typography>
                <Typography variant="body2">출신: {renderSchool(selectedPlayer)}</Typography>
                <Typography variant="body2">
                  신체: {selectedPlayer.plrHt && selectedPlayer.plrWt
                    ? `${selectedPlayer.plrHt}cm / ${selectedPlayer.plrWt}kg`
                    : '-'}
                </Typography>
                <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
                  주요기록: {selectedPlayer.prevRec ?? '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
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
              <Typography variant="body2" color="text.secondary">
                {selectedPlayer.cmnt}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closePickConfirm} color="inherit">취소</Button>
            <Button variant="contained" color="success" onClick={confirmPick}
              disabled={pickMutation.isPending}
              startIcon={pickMutation.isPending ? <CircularProgress size={16} /> : <HowToVoteIcon />}>
              지명 확정
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}
