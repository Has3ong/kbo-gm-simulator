import { useState } from 'react'
import {
  Box, Typography, Paper, Divider, Table, TableHead, TableRow, TableCell,
  TableBody, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Chip, CircularProgress, Select, MenuItem, FormControl, InputLabel,
  Alert,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useCmnCdsByGroup, useUpdateCmnCd } from '../../hooks/useCmnCd'
import type { CmnCd } from '../../types/common'

const CD_ID_LABELS: Record<string, string> = {
  POSN: '포지션', REPR_POSN: '대표포지션', ABLT: '능력치', CITY: '연고도시',
  GAME_STTS: '경기상태', BAT_PTCH_HAND: '투타', TURF_TYPE: '잔디종류',
  CNTRCT_TYPE: '계약종류', PLR_STTS: '선수상태', HIDE_ABLT: '히든능력치',
  FCLTY_TYPE: '시설종류', FCLTY_STTS: '시설상태', STFF_TYPE: '스태프직종',
  STFF_ABLT: '스태프능력치', GAME_TYPE: '경기종류', PLR_TRT_TYPE: '특성',
  SSNT_STTS: '시즌상태', PSTSSNT_STTS: '포스트시즌상태',
  PLR_ORGN: '선수출신', PICK_STTS: '지명상태',
}

export default function SettingsPage() {
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
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>설정</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        시스템 코드 값을 관리합니다.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1.5 }}>공통 코드 관리</Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>코드 그룹</InputLabel>
          <Select
            value={filterCdId}
            label="코드 그룹"
            onChange={(e) => setFilterCdId(e.target.value)}
          >
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
      </Paper>

      {/* 코드 수정 다이얼로그 */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>코드 수정 — {editTarget?.cdId} / {editTarget?.cdVal}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="한글명"
              value={editForm.cdNm}
              onChange={(e) => setEditForm((p) => ({ ...p, cdNm: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="영문명"
              value={editForm.cdEngNm}
              onChange={(e) => setEditForm((p) => ({ ...p, cdEngNm: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="설명"
              value={editForm.cdDesc}
              onChange={(e) => setEditForm((p) => ({ ...p, cdDesc: e.target.value }))}
              fullWidth
              size="small"
              multiline
              rows={3}
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
