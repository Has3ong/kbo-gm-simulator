import {
  Box, Typography, TextField, MenuItem, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Slider, Table, TableHead, TableRow,
  TableCell, TableBody, CircularProgress, Chip, Link as MuiLink,
  FormControl, InputLabel, Select,
} from '@mui/material'
import { Link } from 'react-router-dom'
import { usePlayerSearchPage } from './PlayerSearchPageHooks'
import { REPR_POSN_LABEL } from '../../types/player'
import { formatSalary } from '../../utils/format'

const PLR_ORGN_LABEL: Record<string, string> = {
  KBO:  '자국',
  FOR:  '해외',
  INDP: '독립',
  UNIV: '대학',
}

const PLR_STTS_LABEL: Record<string, string> = {
  AT:  '활동',
  INJ: '부상',
  RET: '은퇴',
  FA:  'FA',
}

function ovrlColor(val: number | null): string | undefined {
  if (val == null) return undefined
  if (val >= 60) return 'primary.main'
  if (val < 40)  return 'text.disabled'
  return undefined
}

export default function PlayerSearchPage() {
  const {
    searchParams,
    setField,
    clearParams,
    advancedOpen,
    setAdvancedOpen,
    players,
    isLoading,
    hasFilter,
  } = usePlayerSearchPage()

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>선수 검색</Typography>

      {/* 기본 검색 바 */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <TextField
          label="이름"
          size="small"
          value={searchParams.plrNm ?? ''}
          onChange={(e) => setField('plrNm', e.target.value)}
          sx={{ width: 160 }}
        />

        <FormControl size="small" sx={{ width: 120 }}>
          <InputLabel>포지션</InputLabel>
          <Select
            label="포지션"
            value={searchParams.reprPosnCd ?? ''}
            onChange={(e) => setField('reprPosnCd', e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            {Object.entries(REPR_POSN_LABEL).map(([val, nm]) => (
              <MenuItem key={val} value={val}>{nm}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 120 }}>
          <InputLabel>출신 리그</InputLabel>
          <Select
            label="출신 리그"
            value={searchParams.plrOrgnCd ?? ''}
            onChange={(e) => setField('plrOrgnCd', e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            {Object.entries(PLR_ORGN_LABEL).map(([val, nm]) => (
              <MenuItem key={val} value={val}>{nm}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 120 }}>
          <InputLabel>상태</InputLabel>
          <Select
            label="상태"
            value={searchParams.plrSttsCd ?? ''}
            onChange={(e) => setField('plrSttsCd', e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            {Object.entries(PLR_STTS_LABEL).map(([val, nm]) => (
              <MenuItem key={val} value={val}>{nm}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" size="small" onClick={() => setAdvancedOpen(true)}>
          상세 검색
        </Button>
        {hasFilter && (
          <Button variant="text" size="small" color="inherit" onClick={clearParams}>
            초기화
          </Button>
        )}
      </Box>

      {/* 상세 검색 다이얼로그 */}
      <Dialog open={advancedOpen} onClose={() => setAdvancedOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>상세 검색</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <Box>
            <Typography variant="body2" gutterBottom>
              종합 능력치 범위: {searchParams.minOvrl ?? 20} ~ {searchParams.maxOvrl ?? 80}
            </Typography>
            <Slider
              value={[searchParams.minOvrl ?? 20, searchParams.maxOvrl ?? 80]}
              min={20} max={80}
              onChange={(_, v) => {
                const [mn, mx] = v as number[]
                setField('minOvrl', mn === 20 ? undefined : mn)
                setField('maxOvrl', mx === 80 ? undefined : mx)
              }}
              valueLabelDisplay="auto"
            />
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel>외국인 여부</InputLabel>
            <Select
              label="외국인 여부"
              value={searchParams.plrFrgnYn ?? ''}
              onChange={(e) => setField('plrFrgnYn', e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="Y">외국인</MenuItem>
              <MenuItem value="N">국내</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdvancedOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 결과 */}
      {!hasFilter && (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          검색 조건을 입력하세요.
        </Typography>
      )}

      {hasFilter && isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {hasFilter && !isLoading && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {players.length}명 (최대 200명)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>포지션</TableCell>
                <TableCell>출신</TableCell>
                <TableCell align="right">종합</TableCell>
                <TableCell align="right">잠재</TableCell>
                <TableCell align="right">연봉</TableCell>
                <TableCell>팀</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((p) => (
                <TableRow key={p.plrId} hover>
                  <TableCell>
                    <MuiLink component={Link} to={`/players/${p.plrId}`} underline="hover">
                      {p.plrNm}
                    </MuiLink>
                  </TableCell>
                  <TableCell>{p.reprPosnNm ?? '-'}</TableCell>
                  <TableCell>
                    {p.plrOrgnCd ? (
                      <Chip label={PLR_ORGN_LABEL[p.plrOrgnCd] ?? p.plrOrgnCd} size="small" />
                    ) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: ovrlColor(p.plrOvrlAblt), fontWeight: (p.plrOvrlAblt ?? 0) >= 60 ? 'bold' : 'normal' }}
                    >
                      {p.plrOvrlAblt ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{p.plrPotAblt ?? '-'}</TableCell>
                  <TableCell align="right">{p.plrAnslSal != null ? formatSalary(p.plrAnslSal).display : '-'}</TableCell>
                  <TableCell>{p.tmKrNm ?? 'FA'}</TableCell>
                  <TableCell>{PLR_STTS_LABEL[p.plrSttsCd ?? ''] ?? p.plrSttsCd ?? '-'}</TableCell>
                </TableRow>
              ))}
              {players.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </Box>
  )
}
