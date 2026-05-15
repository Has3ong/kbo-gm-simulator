import {
  Box, Typography, Paper, Chip, Button, Alert,
  Table, TableBody, TableCell, TableHead, TableRow,
  Checkbox, Tab, Tabs, Select, MenuItem, CircularProgress, Stack,
  Divider,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useRosterConfirmPage, POSN_OPTIONS, BULL_ROLE_OPTIONS, getBullRoleLabel,
} from './RosterConfirmPageHooks'

const POSN_LABEL: Record<string, string> = {
  '1': '포수', '2': '1루수', '3': '2루수', '4': '3루수',
  '5': '유격수', '6': '좌익수', '7': '중견수', '8': '우익수',
  '9': '지명타자', '10': '투수',
}

export default function RosterConfirmPage() {
  const navigate = useNavigate()
  const [rightTab, setRightTab] = useState(0)

  const {
    isLoading,
    isError,
    allPlayers,
    firstTeamIds,
    firstTeamPitchers,
    firstTeamBatters,
    toggleFirstTeam,
    battingOrder,
    handleDragStart,
    handleDropOnSlot,
    removeFromBattingOrder,
    setSlotPosn,
    backupBatters,
    battingOrderPlrIds,
    rotation,
    setRotationSlot,
    rotationPlrIds,
    bullpenPitchers,
    bullpenRoles,
    setBullpenRole,
    dragPlrId,
    firstTeamCount,
    frgnCount,
    validationErrors,
    canConfirm,
    handleConfirm,
    confirmMutation,
  } = useRosterConfirmPage()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return <Alert severity="error">로스터 데이터를 불러오지 못했습니다.</Alert>
  }

  // Sort all players by position code then name
  const sortedPlayers = [...allPlayers].sort((a, b) => {
    const pa = a.REPR_POSN_CD === '10' ? 'z' : (a.REPR_POSN_CD ?? '')
    const pb = b.REPR_POSN_CD === '10' ? 'z' : (b.REPR_POSN_CD ?? '')
    if (pa !== pb) return pa.localeCompare(pb)
    return a.PLR_NM.localeCompare(b.PLR_NM)
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>로스터 확정</Typography>
        <Button variant="outlined" onClick={() => navigate('/season')}>시즌으로 돌아가기</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, minHeight: 600 }}>
        {/* Left panel: player list */}
        <Paper variant="outlined" sx={{ width: '30%', flexShrink: 0, overflow: 'auto', maxHeight: 700 }}>
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>전체 선수 목록</Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell padding="checkbox" sx={{ pl: 1 }}>1군</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>이름</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>포지션</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">OVR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlayers.map((p) => {
                const isFirst = firstTeamIds.has(p.PLR_ID)
                const isFr = p.CNTRCT_TYPE_CD === 'FR'
                return (
                  <TableRow key={p.PLR_ID} hover>
                    <TableCell padding="checkbox" sx={{ pl: 1 }}>
                      <Checkbox
                        size="small"
                        checked={isFirst}
                        onChange={() => toggleFirstTeam(p.PLR_ID)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Typography variant="body2">{p.PLR_NM}</Typography>
                        {isFr && (
                          <Chip label="외" size="small" color="info"
                            sx={{ height: 16, fontSize: 9, '& .MuiChip-label': { px: 0.5 } }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {POSN_LABEL[p.REPR_POSN_CD ?? ''] ?? p.REPR_POSN_CD ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{p.PLR_OVRL_ABLT}</Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>

        {/* Right panel: tabs */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper variant="outlined" sx={{ flex: 1 }}>
            <Tabs value={rightTab} onChange={(_, v) => setRightTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="타순/포지션" />
              <Tab label="선발 로테이션" />
              <Tab label="불펜" />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {/* 타순/포지션 tab */}
              {rightTab === 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    왼쪽 선수를 드래그하여 타순 슬롯에 놓으세요.
                  </Typography>

                  {/* batting order slots */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slot) => {
                      const entry = battingOrder[slot]
                      const plr = entry ? allPlayers.find((p) => p.PLR_ID === entry.plrId) : null
                      return (
                        <Box
                          key={slot}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropOnSlot(slot)}
                          sx={{
                            display: 'flex', gap: 1, alignItems: 'center',
                            p: 1, border: '2px dashed', borderColor: 'divider',
                            borderRadius: 1, minHeight: 44,
                            bgcolor: dragPlrId ? 'action.hover' : 'background.paper',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold', width: 60, flexShrink: 0 }}>
                            {slot}번 타자
                          </Typography>
                          {plr ? (
                            <>
                              <Chip
                                label={`${plr.PLR_NM} (${plr.PLR_OVRL_ABLT})`}
                                size="small"
                                onDelete={() => removeFromBattingOrder(slot)}
                              />
                              <Select
                                size="small"
                                value={entry?.posnCd ?? '9'}
                                onChange={(e) => setSlotPosn(slot, e.target.value)}
                                sx={{ fontSize: 12, height: 28, minWidth: 90 }}
                              >
                                {POSN_OPTIONS.map((opt) => (
                                  <MenuItem key={opt.code} value={opt.code} sx={{ fontSize: 13 }}>
                                    {opt.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              선수 없음
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Box>

                  {/* Available batters to drag */}
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
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
                    {firstTeamBatters.length === 0 && (
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        1군 야수가 없습니다.
                      </Typography>
                    )}
                  </Box>

                  {backupBatters.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5, color: 'text.secondary' }}>
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

              {/* 선발 로테이션 tab */}
              {rightTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                    선발 투수 5명을 지정하세요.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const plrId = rotation[idx]
                      const plr = plrId ? allPlayers.find((p) => p.PLR_ID === plrId) : null
                      return (
                        <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', width: 50, flexShrink: 0 }}>
                            {idx + 1}선발
                          </Typography>
                          <Select
                            size="small"
                            value={plrId ?? ''}
                            onChange={(e) =>
                              setRotationSlot(idx, e.target.value ? Number(e.target.value) : null)
                            }
                            displayEmpty
                            sx={{ minWidth: 180 }}
                          >
                            <MenuItem value=""><em>선택 안함</em></MenuItem>
                            {firstTeamPitchers.map((p) => (
                              <MenuItem
                                key={p.PLR_ID}
                                value={p.PLR_ID}
                                disabled={rotationPlrIds.has(p.PLR_ID) && plrId !== p.PLR_ID}
                              >
                                {p.PLR_NM} ({p.PLR_OVRL_ABLT})
                              </MenuItem>
                            ))}
                          </Select>
                          {plr && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              OVR {plr.PLR_OVRL_ABLT}
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              )}

              {/* 불펜 tab */}
              {rightTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                    불펜 투수 역할을 배정하세요. (기본값: 중간계투)
                  </Typography>
                  {bullpenPitchers.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      불펜 투수가 없습니다. (1군 투수를 추가하거나 선발 슬롯을 줄이세요.)
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>이름</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }} align="right">OVR</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>역할</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bullpenPitchers.map((p) => (
                          <TableRow key={p.PLR_ID} hover>
                            <TableCell>{p.PLR_NM}</TableCell>
                            <TableCell align="right">{p.PLR_OVRL_ABLT}</TableCell>
                            <TableCell>
                              <Select
                                size="small"
                                value={bullpenRoles[p.PLR_ID] ?? 'MR'}
                                onChange={(e) => setBullpenRole(p.PLR_ID, e.target.value)}
                                sx={{ minWidth: 120 }}
                              >
                                {BULL_ROLE_OPTIONS.map((opt) => (
                                  <MenuItem key={opt.code} value={opt.code}>
                                    {getBullRoleLabel(opt.code)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Box>
              )}
            </Box>
          </Paper>

          {/* Bottom bar */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                label={`1군: ${firstTeamCount}명 (최소 20, 최대 29)`}
                color={
                  firstTeamCount < 20 ? 'error'
                    : firstTeamCount > 29 ? 'error'
                      : 'success'
                }
              />
              <Chip label={`외국인: ${frgnCount}/3명`} color={frgnCount > 3 ? 'error' : 'default'} />
              <Box sx={{ flex: 1 }} />
              {validationErrors.map((msg, i) => (
                <Alert key={i} severity="error" sx={{ py: 0 }}>{msg}</Alert>
              ))}
              {confirmMutation.isError && (
                <Alert severity="error" sx={{ py: 0 }}>
                  {(confirmMutation.error as Error)?.message ?? '확정에 실패했습니다.'}
                </Alert>
              )}
              <Button
                variant="contained"
                color="primary"
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                로스터 확정
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
