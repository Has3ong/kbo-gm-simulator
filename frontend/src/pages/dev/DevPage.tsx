import { useState } from 'react'
import {
  Box, Typography, Paper, Button, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Alert, CircularProgress, Snackbar,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import { Link } from 'react-router-dom'
import BugReportIcon from '@mui/icons-material/BugReport'
import SportsCricketIcon from '@mui/icons-material/SportsCricket'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import { useFcltyCosts, useUpdateFcltyCosts } from '../../hooks/useDev'
import { useCmnCdsByGroup, useUpdateCmnCd } from '../../hooks/useCmnCd'
import type { FcltyCostRow } from '../../api/devApi'
import type { CmnCd } from '../../types/common'

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

  const { data: codes = [], isLoading } = useCmnCdsByGroup(filterCdId)
  const updateMutation = useUpdateCmnCd()
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

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        공통 코드 값을 관리합니다. 코드 그룹을 선택하면 해당 코드 목록이 표시됩니다.
      </Typography>

      <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>코드 그룹</InputLabel>
        <Select value={filterCdId} label="코드 그룹" onChange={(e) => setFilterCdId(e.target.value)}>
          {cdIds.map((id) => (
            <MenuItem key={id} value={id}>{CD_ID_LABELS[id] ?? id} ({id})</MenuItem>
          ))}
        </Select>
      </FormControl>

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
                <TableCell sx={{ fontWeight: 'bold', width: 60 }}></TableCell>
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
                    <Button size="small" startIcon={<EditIcon sx={{ fontSize: 14 }} />} onClick={() => openEdit(c)}>
                      수정
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

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
    </Box>
  )
}

// ───────────────────────────────── DevPage 메인 ──────────────────────────────────

type TabValue = 'shortcut' | 'facility-costs' | 'codes'

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
    </Box>
  )
}
