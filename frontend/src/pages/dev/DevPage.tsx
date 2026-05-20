import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Button, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Alert, CircularProgress, Snackbar,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
} from '@mui/material'
import { Link } from 'react-router-dom'
import BugReportIcon from '@mui/icons-material/BugReport'
import SportsCricketIcon from '@mui/icons-material/SportsCricket'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import TuneIcon from '@mui/icons-material/Tune'
import { useFcltyCosts, useUpdateFcltyCosts, useSpringCampDevStatus, useResetSpringCamp } from '../../hooks/useDev'
import { useCmnCdsByGroup, useUpdateCmnCd, useCreateCmnCd, useDeleteCmnCd } from '../../hooks/useCmnCd'
import { useTeams } from '../../hooks/useTeams'
import { useOwnerPrpnst, useUpsertOwnerPrpnst } from '../../hooks/useOwnerPrpnst'
import { useFanPrpnst, useUpsertFanPrpnst } from '../../hooks/useFanPrpnst'
import { useSpringCampCfg, useUpdateSpringCampCfg } from '../../hooks/useSpringCampCfg'
import { useSpringCampLocations, useSelectSpringCamp } from '../../hooks/useSpringCamp'
import type { FcltyCostRow } from '../../api/devApi'
import type { CmnCd } from '../../types/common'
import type { SpringCampCfg } from '../../api/springCampCfgApi'

// ───────────────────────────────── 시설 업그레이드 비용 탭 ──────────────────────────────────

const FCLTY_NM: Record<string, string> = {
  TRNG: '훈련 시설',
  RHLB: '재활 시설',
  SCTG: '스카우팅 시설',
  ANLY: '분석 시설',
  CAFE: '카페 시설',
  YUTH: '유소년 시설',
}

function FcltyCostTab() {
  const { data: costs = [], isLoading } = useFcltyCosts()
  const updateMutation = useUpdateFcltyCosts()

  // 편집 중인 값: key = `${fcltyTypeCd}_${fromLvl}`, value = { upgrCost, upgrDays }
  const [edits, setEdits] = useState<Record<string, { upgrCost: string; upgrDays: string }>>({})
  const [snackOpen, setSnackOpen] = useState(false)

  const key = (row: FcltyCostRow) => `${row.fcltyTypeCd}_${row.fromLvl}`

  const getVal = (row: FcltyCostRow, field: 'upgrCost' | 'upgrDays') => {
    const k = key(row)
    if (edits[k]) return edits[k][field]
    return String(field === 'upgrCost' ? row.upgrCost : row.upgrDays)
  }

  const handleChange = (row: FcltyCostRow, field: 'upgrCost' | 'upgrDays', val: string) => {
    const k = key(row)
    setEdits((prev) => ({
      ...prev,
      [k]: {
        upgrCost: prev[k]?.upgrCost ?? String(row.upgrCost),
        upgrDays: prev[k]?.upgrDays ?? String(row.upgrDays),
        [field]: val,
      },
    }))
  }

  const handleSave = async () => {
    const changedRows: FcltyCostRow[] = costs.map((row) => {
      const k = key(row)
      if (!edits[k]) return row
      return {
        ...row,
        upgrCost: Number(edits[k].upgrCost) || row.upgrCost,
        upgrDays: Number(edits[k].upgrDays) || row.upgrDays,
      }
    })
    await updateMutation.mutateAsync(changedRows)
    setEdits({})
    setSnackOpen(true)
  }

  // 시설 타입별 그룹핑
  const grouped = costs.reduce<Record<string, FcltyCostRow[]>>((acc, row) => {
    if (!acc[row.fcltyTypeCd]) acc[row.fcltyTypeCd] = []
    acc[row.fcltyTypeCd].push(row)
    return acc
  }, {})

  const hasEdits = Object.keys(edits).length > 0

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          시설 업그레이드 비용(만원)과 공사 기간(일)을 직접 수정할 수 있습니다.
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasEdits || updateMutation.isPending}
          size="small"
        >
          {updateMutation.isPending ? '저장 중...' : '변경 저장'}
        </Button>
      </Box>

      {hasEdits && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          수정된 항목이 있습니다. 저장 버튼을 눌러 적용하세요.
        </Alert>
      )}

      {Object.entries(grouped).map(([fcltyTypeCd, rows]) => (
        <Paper key={fcltyTypeCd} variant="outlined" sx={{ mb: 2 }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {FCLTY_NM[fcltyTypeCd] ?? fcltyTypeCd}
              <Chip label={fcltyTypeCd} size="small" variant="outlined" sx={{ ml: 1, fontSize: 11 }} />
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>레벨 구간</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>업그레이드 비용 (만원)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>공사 기간 (일)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const k = key(row)
                const isEdited = !!edits[k]
                return (
                  <TableRow key={k} sx={isEdited ? { bgcolor: 'warning.50' } : {}}>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Lv.{row.fromLvl} → Lv.{row.toLvl}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={getVal(row, 'upgrCost')}
                        onChange={(e) => handleChange(row, 'upgrCost', e.target.value)}
                        slotProps={{ htmlInput: { style: { width: 120, textAlign: 'right' } } }}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={getVal(row, 'upgrDays')}
                        onChange={(e) => handleChange(row, 'upgrDays', e.target.value)}
                        slotProps={{ htmlInput: { style: { width: 80, textAlign: 'right' } } }}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>
      ))}

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message="시설 업그레이드 비용 저장 완료"
      />
    </Box>
  )
}

// ───────────────────────────────── 스프링 캠프 수치 조정 ──────────────────────────────────

function SpringCampCfgCard() {
  const { data: camps = [], isLoading } = useSpringCampCfg()
  const updateMutation = useUpdateSpringCampCfg()
  const [open, setOpen] = useState(false)
  const [edits, setEdits] = useState<Record<string, Partial<SpringCampCfg>>>({})
  const [snackOpen, setSnackOpen] = useState(false)

  const getVal = (camp: SpringCampCfg, field: 'growthAbltCnt' | 'maxGrowthPerAblt') => {
    return edits[camp.campCd]?.[field] !== undefined
      ? String(edits[camp.campCd][field])
      : String(camp[field])
  }

  const handleChange = (camp: SpringCampCfg, field: 'growthAbltCnt' | 'maxGrowthPerAblt', val: string) => {
    setEdits((prev) => ({
      ...prev,
      [camp.campCd]: { ...prev[camp.campCd], [field]: Number(val) || 0 },
    }))
  }

  const handleSave = async () => {
    for (const camp of camps) {
      const edit = edits[camp.campCd]
      if (!edit) continue
      await updateMutation.mutateAsync({ campCd: camp.campCd, data: { ...camp, ...edit } })
    }
    setEdits({})
    setSnackOpen(true)
  }

  const hasEdits = Object.keys(edits).length > 0

  return (
    <>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TuneIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>스프링 캠프 수치 조정</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          캠프별 능력치 성장 횟수와 능력치당 최대 성장치를 관리합니다.
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)} sx={{ width: '100%' }}>
          수치 조정하기
        </Button>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>스프링 캠프 수치 조정</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              {hasEdits && <Alert severity="warning" sx={{ mb: 2 }}>수정된 항목이 있습니다.</Alert>}
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>캠프</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>성장 능력치 수</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>능력치당 최대 성장</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {camps.map((camp) => (
                    <TableRow key={camp.campCd} sx={edits[camp.campCd] ? { bgcolor: 'warning.50' } : {}}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{camp.campNm}</TableCell>
                      <TableCell>{camp.tier}</TableCell>
                      <TableCell>
                        <TextField
                          size="small" type="number"
                          value={getVal(camp, 'growthAbltCnt')}
                          onChange={(e) => handleChange(camp, 'growthAbltCnt', e.target.value)}
                          slotProps={{ htmlInput: { min: 1, max: 10, style: { width: 60, textAlign: 'right' } } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small" type="number"
                          value={getVal(camp, 'maxGrowthPerAblt')}
                          onChange={(e) => handleChange(camp, 'maxGrowthPerAblt', e.target.value)}
                          slotProps={{ htmlInput: { min: 1, max: 10, style: { width: 60, textAlign: 'right' } } }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>닫기</Button>
          <Button
            variant="contained" startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasEdits || updateMutation.isPending}
          >
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} message="스프링 캠프 수치 저장 완료" />
    </>
  )
}

// ───────────────────────────────── 스프링 캠프 진행 테스트 ──────────────────────────────────

function SpringCampTestCard() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useSpringCampDevStatus()
  const { data: locations = [], isLoading: locsLoading } = useSpringCampLocations()
  const resetMutation    = useResetSpringCamp()
  const selectMutation   = useSelectSpringCamp()

  const [selectedLoc, setSelectedLoc] = useState('')
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleReset = async () => {
    setResult(null)
    try {
      await resetMutation.mutateAsync()
      await refetchStatus()
      setResult({ ok: true, msg: '초기화 완료 — CUR_DT가 2월 1일로 되돌아갔습니다.' })
    } catch (e) {
      setResult({ ok: false, msg: `초기화 실패: ${(e as Error).message}` })
    }
  }

  const handleRun = async () => {
    if (!selectedLoc) return
    setResult(null)
    try {
      await selectMutation.mutateAsync(selectedLoc)
      await refetchStatus()
      const locNm = locations.find((l) => l.code === selectedLoc)?.name ?? selectedLoc
      setResult({ ok: true, msg: `스프링 캠프 완료 — ${locNm} 선택, CUR_DT가 3월 15일로 이동했습니다.` })
    } catch (e) {
      setResult({ ok: false, msg: `실행 실패: ${(e as Error).message}` })
    }
  }

  const isPending = resetMutation.isPending || selectMutation.isPending

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <SportsCricketIcon color="success" />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>스프링 캠프 진행 테스트</Typography>
      </Box>

      {/* 현재 상태 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {statusLoading ? (
          <CircularProgress size={16} />
        ) : (
          <>
            <Chip
              label={status?.done ? '완료됨' : '미완료'}
              color={status?.done ? 'success' : 'default'}
              size="small"
            />
            {status?.locCd && (
              <Chip label={`캠프: ${status.locCd}`} size="small" variant="outlined" />
            )}
            {status?.curDt && (
              <Chip label={`CUR_DT: ${status.curDt}`} size="small" variant="outlined" color="info" />
            )}
          </>
        )}
      </Box>

      {/* 캠프 선택 */}
      <FormControl size="small" fullWidth sx={{ mb: 1.5 }} disabled={locsLoading || isPending}>
        <InputLabel>캠프 위치</InputLabel>
        <Select
          value={selectedLoc}
          label="캠프 위치"
          onChange={(e) => setSelectedLoc(e.target.value)}
        >
          {locations.map((loc) => (
            <MenuItem key={loc.code} value={loc.code}>
              {loc.name} (Tier {loc.tier} / {loc.cost?.toLocaleString()}만원)
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 결과 */}
      {result && (
        <Alert severity={result.ok ? 'success' : 'error'} sx={{ mb: 1.5 }} onClose={() => setResult(null)}>
          {result.msg}
        </Alert>
      )}

      {/* 버튼 */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={handleReset}
          disabled={isPending}
          sx={{ flex: 1 }}
        >
          {resetMutation.isPending ? '초기화 중...' : '플래그 초기화'}
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={handleRun}
          disabled={!selectedLoc || isPending}
          sx={{ flex: 1 }}
        >
          {selectMutation.isPending ? '진행 중...' : '스프링 캠프 실행'}
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        초기화: SPRING_CAMP_DONE=0, CUR_DT=2/1 &nbsp;|&nbsp; 실행: 선수 성장 + 이벤트 생성 + CUR_DT=3/15
      </Typography>
    </Paper>
  )
}

// ───────────────────────────────── 코드 변경 탭 (기존 SettingsPage) ──────────────────────────────────

const CD_ID_LABELS: Record<string, string> = {
  POSN: '포지션', REPR_POSN: '대표포지션', ABLT: '능력치', CITY: '연고도시',
  GAME_STTS: '경기상태', BAT_PTCH_HAND: '투타', TURF_TYPE: '잔디종류',
  CNTRCT_TYPE: '계약종류', PLR_STTS: '선수상태', HIDE_ABLT: '히든능력치',
  FCLTY_TYPE: '시설종류', FCLTY_STTS: '시설상태', STFF_TYPE: '스태프직종',
  STFF_ABLT: '스태프능력치', GAME_TYPE: '경기종류', PLR_TRT_TYPE: '특성',
  SSNT_STTS: '시즌상태', PSTSSNT_STTS: '포스트시즌상태',
  PLR_ORGN: '선수출신', PICK_STTS: '지명상태',
}

function CodeEditTab() {
  const [filterCdId, setFilterCdId] = useState('')
  const [editTarget, setEditTarget] = useState<CmnCd | null>(null)
  const [editForm, setEditForm] = useState({ cdNm: '', cdEngNm: '', cdDesc: '' })
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ cdId: '', cdVal: '', cdNm: '', cdEngNm: '', cdDesc: '' })
  const [deleteTarget, setDeleteTarget] = useState<CmnCd | null>(null)

  const { data: codes = [], isLoading } = useCmnCdsByGroup(filterCdId)
  const updateMutation = useUpdateCmnCd()
  const createMutation = useCreateCmnCd()
  const deleteMutation = useDeleteCmnCd()
  const cdIds = Object.keys(CD_ID_LABELS).sort()

  const openEdit = (code: CmnCd) => {
    setEditTarget(code)
    setEditForm({ cdNm: code.cdNm, cdEngNm: code.cdEngNm ?? '', cdDesc: code.cdDesc ?? '' })
  }

  const handleSave = async () => {
    if (!editTarget) return
    await updateMutation.mutateAsync({
      cdId: editTarget.cdId,
      cdVal: editTarget.cdVal,
      data: { cdNm: editForm.cdNm, cdEngNm: editForm.cdEngNm || null, cdDesc: editForm.cdDesc || null },
    })
    setEditTarget(null)
  }

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      cdId: createForm.cdId || filterCdId,
      cdVal: createForm.cdVal,
      cdNm: createForm.cdNm,
      cdEngNm: createForm.cdEngNm || null,
      cdDesc: createForm.cdDesc || null,
    })
    setCreateOpen(false)
    setCreateForm({ cdId: '', cdVal: '', cdNm: '', cdEngNm: '', cdDesc: '' })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync({ cdId: deleteTarget.cdId, cdVal: deleteTarget.cdVal })
    setDeleteTarget(null)
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        공통 코드 값을 관리합니다. 코드 그룹을 선택하면 해당 코드 목록이 표시됩니다.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>코드 그룹</InputLabel>
          <Select value={filterCdId} label="코드 그룹" onChange={(e) => setFilterCdId(e.target.value)}>
            {cdIds.map((id) => (
              <MenuItem key={id} value={id}>{CD_ID_LABELS[id] ?? id} ({id})</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined" size="small" startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          disabled={filterCdId === ''}
        >
          코드 추가
        </Button>
      </Box>

      {filterCdId === '' ? (
        <Alert severity="info">코드 그룹을 선택하면 해당 코드 목록이 표시됩니다.</Alert>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>그룹 (CD_ID)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>코드값 (CD_VAL)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>한글명</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>영문명</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>설명</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 90 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {codes.map((c) => (
                <TableRow key={`${c.cdId}_${c.cdVal}`} hover>
                  <TableCell>
                    <Chip label={c.cdId} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{c.cdVal}</TableCell>
                  <TableCell>{c.cdNm}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>{c.cdEngNm ?? '-'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 11, maxWidth: 200 }}>
                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.cdDesc ?? '-'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Button size="small" startIcon={<EditIcon sx={{ fontSize: 14 }} />} onClick={() => openEdit(c)}>
                        수정
                      </Button>
                      <Tooltip title="삭제">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* 수정 다이얼로그 */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>코드 수정 — {editTarget?.cdId} / {editTarget?.cdVal}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="한글명"
              value={editForm.cdNm}
              onChange={(e) => setEditForm((p) => ({ ...p, cdNm: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="영문명"
              value={editForm.cdEngNm}
              onChange={(e) => setEditForm((p) => ({ ...p, cdEngNm: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="설명"
              value={editForm.cdDesc}
              onChange={(e) => setEditForm((p) => ({ ...p, cdDesc: e.target.value }))}
              fullWidth size="small" multiline rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateMutation.isPending || !editForm.cdNm}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 추가 다이얼로그 */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>코드 추가</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="그룹 (CD_ID)"
              value={createForm.cdId || filterCdId}
              onChange={(e) => setCreateForm((p) => ({ ...p, cdId: e.target.value }))}
              fullWidth size="small"
              helperText="비워두면 현재 선택된 그룹으로 저장됩니다."
            />
            <TextField
              label="코드값 (CD_VAL) *"
              value={createForm.cdVal}
              onChange={(e) => setCreateForm((p) => ({ ...p, cdVal: e.target.value }))}
              fullWidth size="small" required
            />
            <TextField
              label="한글명 *"
              value={createForm.cdNm}
              onChange={(e) => setCreateForm((p) => ({ ...p, cdNm: e.target.value }))}
              fullWidth size="small" required
            />
            <TextField
              label="영문명"
              value={createForm.cdEngNm}
              onChange={(e) => setCreateForm((p) => ({ ...p, cdEngNm: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="설명"
              value={createForm.cdDesc}
              onChange={(e) => setCreateForm((p) => ({ ...p, cdDesc: e.target.value }))}
              fullWidth size="small" multiline rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>취소</Button>
          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={createMutation.isPending || !createForm.cdVal || !createForm.cdNm}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>코드 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{deleteTarget?.cdId} / {deleteTarget?.cdVal}</strong> ({deleteTarget?.cdNm}) 코드를 삭제하시겠습니까?
          </Typography>
          <Alert severity="warning" sx={{ mt: 1 }}>삭제 후 복구할 수 없습니다.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>취소</Button>
          <Button
            variant="contained" color="error"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// ───────────────────────────────── 구단주 성향 편집 탭 ──────────────────────────────────

const OWNER_PRPNST_FIELDS: { key: string; label: string }[] = [
  { key: 'patience', label: '인내심' },
  { key: 'ambition', label: '야망' },
  { key: 'financialStrictness', label: '재정 엄격도' },
  { key: 'investmentWillingness', label: '투자 의지' },
  { key: 'youthPreference', label: '육성 선호도' },
  { key: 'starPreference', label: '스타 선수 선호도' },
  { key: 'loyaltyToGm', label: '단장 신뢰도' },
  { key: 'rebuildTolerance', label: '리빌딩 허용도' },
  { key: 'winNowPreference', label: '즉시 성과 선호도' },
  { key: 'analyticsPreference', label: '데이터 분석 선호도' },
  { key: 'scoutingPreference', label: '전통 스카우팅 선호도' },
  { key: 'fanPressureSensitivity', label: '팬 여론 민감도' },
  { key: 'mediaSensitivity', label: '미디어 민감도' },
  { key: 'localIdentityPreference', label: '지역 연고 중시도' },
  { key: 'veteranPreference', label: '베테랑 선호도' },
  { key: 'foreignPlayerInvestment', label: '외국인 선수 투자 성향' },
  { key: 'performanceOverPopularity', label: '성적 중시도' },
  { key: 'riskTolerance', label: '리스크 감수도' },
  { key: 'facilityPreference', label: '시설 투자 선호도' },
  { key: 'staffInvestmentPreference', label: '스태프 투자 선호도' },
  { key: 'currentSatisfaction', label: '현재 만족도 (상태값)' },
  { key: 'firingRisk', label: '해고 위험도 (상태값)' },
  { key: 'budgetFlexibility', label: '예산 승인 성향' },
  { key: 'pitcherPreference', label: '투수 선호도' },
  { key: 'batterPreference', label: '타자 선호도' },
]

function OwnerPrpnstEditTab() {
  const { data: teams = [] } = useTeams()
  const [selectedTmId, setSelectedTmId] = useState<number | ''>('')
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [snackOpen, setSnackOpen] = useState(false)

  const { data: prpnst, isLoading } = useOwnerPrpnst(selectedTmId !== '' ? selectedTmId : undefined)
  const upsertMutation = useUpsertOwnerPrpnst()

  useEffect(() => { setEdits({}) }, [selectedTmId])

  const getValue = (key: string) => {
    if (edits[key] !== undefined) return edits[key]
    return prpnst ? String((prpnst as unknown as Record<string, unknown>)[key] ?? '') : ''
  }

  const handleSave = async () => {
    if (selectedTmId === '') return
    const data: Record<string, number> = {}
    for (const [k, v] of Object.entries(edits)) {
      const n = Number(v)
      if (!isNaN(n) && n >= 1 && n <= 100) data[k] = n
    }
    await upsertMutation.mutateAsync({ tmId: selectedTmId as number, data })
    setEdits({})
    setSnackOpen(true)
  }

  const hasEdits = Object.keys(edits).length > 0

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>팀 선택</InputLabel>
          <Select value={selectedTmId} label="팀 선택" onChange={(e) => setSelectedTmId(e.target.value as number)}>
            {teams.map((t) => <MenuItem key={t.tmId} value={t.tmId}>{t.tmKrNm}</MenuItem>)}
          </Select>
        </FormControl>
        <Button
          variant="contained" startIcon={<SaveIcon />} size="small"
          onClick={handleSave}
          disabled={selectedTmId === '' || !hasEdits || upsertMutation.isPending}
        >
          {upsertMutation.isPending ? '저장 중...' : '저장'}
        </Button>
      </Box>

      {hasEdits && <Alert severity="warning" sx={{ mb: 2 }}>수정된 항목이 있습니다.</Alert>}

      {selectedTmId === '' ? (
        <Alert severity="info">팀을 선택하면 구단주 성향을 편집할 수 있습니다.</Alert>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>항목</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>값 (1~100)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {OWNER_PRPNST_FIELDS.map((f) => (
                <TableRow key={f.key} sx={edits[f.key] !== undefined ? { bgcolor: 'warning.50' } : {}}>
                  <TableCell>{f.label}</TableCell>
                  <TableCell>
                    <TextField
                      size="small" type="number"
                      value={getValue(f.key)}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      slotProps={{ htmlInput: { min: 1, max: 100, style: { width: 80, textAlign: 'right' } } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} message="구단주 성향 저장 완료" />
    </Box>
  )
}

// ───────────────────────────────── 팬/서포터즈 성향 편집 탭 ──────────────────────────────────

const FAN_PRPNST_FIELDS: { key: string; label: string }[] = [
  { key: 'fanLoyalty', label: '팬 충성도' },
  { key: 'fanSatisfaction', label: '현재 팬 만족도 (상태값)' },
  { key: 'expectationLevel', label: '기대치' },
  { key: 'performanceSensitivity', label: '성적 민감도' },
  { key: 'rebuildPatience', label: '리빌딩 인내도' },
  { key: 'starPlayerPreference', label: '스타 선수 선호도' },
  { key: 'franchisePlayerAttachment', label: '프랜차이즈 선수 애착' },
  { key: 'prospectPreference', label: '유망주 선호도' },
  { key: 'veteranPreference', label: '베테랑 선호도' },
  { key: 'foreignPlayerExpectation', label: '외국인 선수 기대치' },
  { key: 'localIdentity', label: '지역 연고 의식' },
  { key: 'traditionPreference', label: '전통/역사 중시도' },
  { key: 'supportIntensity', label: '응원 열기' },
  { key: 'rivalryIntensity', label: '라이벌 의식' },
  { key: 'attendancePower', label: '관중 동원력' },
  { key: 'merchandiseAffinity', label: '굿즈 구매 성향' },
  { key: 'ticketPriceSensitivity', label: '티켓 가격 민감도' },
  { key: 'seasonTicketLoyalty', label: '시즌권 충성도' },
  { key: 'awayFanPower', label: '원정 팬 파워' },
  { key: 'mediaAmplification', label: '미디어 확산력' },
  { key: 'criticismTendency', label: '비판 성향' },
  { key: 'patience', label: '인내심' },
  { key: 'emotionalVolatility', label: '감정 기복' },
  { key: 'offensePreference', label: '공격 야구 선호도' },
  { key: 'pitchingPreference', label: '투수 야구 선호도' },
  { key: 'defensePreference', label: '수비/기본기 선호도' },
  { key: 'aggressiveManagementPreference', label: '공격적 운영 선호도' },
  { key: 'currentPopularity', label: '현재 인기 (상태값)' },
  { key: 'averageAttendance', label: '평균 관중 수 (상태값)' },
  { key: 'seasonTicketHolders', label: '시즌권 보유자 수 (상태값)' },
  { key: 'fanDiscontent', label: '팬 불만도 (상태값)' },
  { key: 'demandLevel', label: '팬 요구 수준 (상태값)' },
]

function FanPrpnstEditTab() {
  const { data: teams = [] } = useTeams()
  const [selectedTmId, setSelectedTmId] = useState<number | ''>('')
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [snackOpen, setSnackOpen] = useState(false)

  const { data: prpnst, isLoading } = useFanPrpnst(selectedTmId !== '' ? selectedTmId : undefined)
  const upsertMutation = useUpsertFanPrpnst()

  useEffect(() => { setEdits({}) }, [selectedTmId])

  const getValue = (key: string) => {
    if (edits[key] !== undefined) return edits[key]
    return prpnst ? String((prpnst as unknown as Record<string, unknown>)[key] ?? '') : ''
  }

  const handleSave = async () => {
    if (selectedTmId === '') return
    const data: Record<string, number> = {}
    for (const [k, v] of Object.entries(edits)) {
      const n = Number(v)
      if (!isNaN(n)) data[k] = n
    }
    await upsertMutation.mutateAsync({ tmId: selectedTmId as number, data })
    setEdits({})
    setSnackOpen(true)
  }

  const hasEdits = Object.keys(edits).length > 0

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>팀 선택</InputLabel>
          <Select value={selectedTmId} label="팀 선택" onChange={(e) => setSelectedTmId(e.target.value as number)}>
            {teams.map((t) => <MenuItem key={t.tmId} value={t.tmId}>{t.tmKrNm}</MenuItem>)}
          </Select>
        </FormControl>
        <Button
          variant="contained" startIcon={<SaveIcon />} size="small"
          onClick={handleSave}
          disabled={selectedTmId === '' || !hasEdits || upsertMutation.isPending}
        >
          {upsertMutation.isPending ? '저장 중...' : '저장'}
        </Button>
      </Box>

      {hasEdits && <Alert severity="warning" sx={{ mb: 2 }}>수정된 항목이 있습니다.</Alert>}

      {selectedTmId === '' ? (
        <Alert severity="info">팀을 선택하면 팬/서포터즈 성향을 편집할 수 있습니다.</Alert>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>항목</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>값</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {FAN_PRPNST_FIELDS.map((f) => (
                <TableRow key={f.key} sx={edits[f.key] !== undefined ? { bgcolor: 'warning.50' } : {}}>
                  <TableCell>{f.label}</TableCell>
                  <TableCell>
                    <TextField
                      size="small" type="number"
                      value={getValue(f.key)}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      slotProps={{ htmlInput: { min: 0, style: { width: 100, textAlign: 'right' } } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} message="팬/서포터즈 성향 저장 완료" />
    </Box>
  )
}

// ───────────────────────────────── DevPage 메인 ──────────────────────────────────

type TabValue = 'shortcut' | 'facility-costs' | 'codes' | 'owner-prpnst' | 'fan-prpnst'

export default function DevPage() {
  const [tab, setTab] = useState<TabValue>('shortcut')

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <BugReportIcon sx={{ color: 'warning.main', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>개발자 도구</Typography>
        <Chip label="DEV ONLY" size="small" color="warning" variant="outlined" />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        기능 테스트 및 게임 설정 관리 페이지입니다.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="바로가기" value="shortcut" />
        <Tab label="시설 업그레이드 비용" value="facility-costs" />
        <Tab label="코드 변경하기" value="codes" />
        <Tab icon={<BusinessIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="구단주 성향" value="owner-prpnst" />
        <Tab icon={<PeopleIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="팬 성향" value="fan-prpnst" />
      </Tabs>

      {tab === 'shortcut' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SportsCricketIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>드래프트</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              신인 드래프트 이벤트 페이지로 이동합니다. 드래프트 생성·진행·AI 시뮬레이션을 테스트합니다.
            </Typography>
            <Button variant="contained" component={Link} to="/draft-event" sx={{ width: '100%' }}>
              드래프트 장으로 이동
            </Button>
          </Paper>
          <SpringCampCfgCard />
          <SpringCampTestCard />
        </Box>
      )}

      {tab === 'facility-costs' && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>시설 업그레이드 비용 설정</Typography>
          <Divider sx={{ mb: 2 }} />
          <FcltyCostTab />
        </Paper>
      )}

      {tab === 'codes' && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>공통 코드 관리</Typography>
          <Divider sx={{ mb: 2 }} />
          <CodeEditTab />
        </Paper>
      )}

      {tab === 'owner-prpnst' && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>구단주 성향 편집</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            팀별 구단주 성향을 확인하고 편집합니다. 시즌 시작 시 랜덤으로 생성됩니다.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <OwnerPrpnstEditTab />
        </Paper>
      )}

      {tab === 'fan-prpnst' && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>팬/서포터즈 성향 편집</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            팀별 팬/서포터즈 성향을 확인하고 편집합니다. 시즌 시작 시 랜덤으로 생성됩니다.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <FanPrpnstEditTab />
        </Paper>
      )}
    </Box>
  )
}
