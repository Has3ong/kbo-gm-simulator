import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Tab, Tabs, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
  TextField, CircularProgress, Typography, Alert,
} from '@mui/material'
import { useFrgnPlrCandidates, useMakeFrgnOffer, useStopFrgnPlr, useFrgnSignedInfo } from '../hooks/useFrgnPlr'
import { formatSalary } from '../utils/format'

// 백엔드 응답 필드명과 1:1 대응
interface FrgnPlrCandidate {
  candId: number
  plrNm: string
  ntlyCd: string        // 국적 코드
  age: number
  plrTypeCd: string     // 'P' = 투수, 'B' = 타자
  reprPosnCd: string    // 포지션 코드
  prvLgNm: string       // 이전 리그
  wantSal: number       // 희망 연봉 (만원)
  ovrl: number          // 종합능력치
  potAblt: number       // 잠재능력치
  cntrctSttsCd: string  // AVAIL, SIGNED, AI_SIGNED
  sgndTmId?: number
  sgndTmNm?: string     // 계약한 팀명
  stats: Record<string, number>  // 스탯 맵 (ERA, IP, W, L, SO, WHIP / AVG, HR, RBI, OBP, SLG, SB)
  offerStatus?: {
    offerId: number
    offerSal: number
    offerSttsCd: string
    offerDt: string
  } | null
}

interface ForeignPlayerModalProps {
  open: boolean
  onClose: () => void
  ssntYr: number
}

const MAX_FRGN_PLR = 3

export default function ForeignPlayerModal({ open, onClose, ssntYr }: ForeignPlayerModalProps) {
  const [tab, setTab] = useState(0)
  const [offerSals, setOfferSals] = useState<Record<number, string>>({})

  const { data: candidates = [], isLoading, isError } = useFrgnPlrCandidates(ssntYr)
  const { data: signedInfo } = useFrgnSignedInfo(ssntYr)
  const makeoffer = useMakeFrgnOffer(ssntYr)
  const stopMutation = useStopFrgnPlr(ssntYr)

  const pitchers = (candidates as FrgnPlrCandidate[]).filter((c) => c.plrTypeCd === 'P')
  const batters = (candidates as FrgnPlrCandidate[]).filter((c) => c.plrTypeCd === 'B')
  const currentList = tab === 0 ? pitchers : batters

  // 서버에서 받은 계약 수 우선, 없으면 클라이언트 계산
  const signedCount = signedInfo?.signedCnt ??
    (candidates as FrgnPlrCandidate[]).filter((c) => c.cntrctSttsCd === 'SIGNED').length
  const maxFrgnPlr = signedInfo?.maxFrgnPlr ?? MAX_FRGN_PLR

  function handleOffer(candId: number) {
    const sal = parseInt(offerSals[candId] ?? '10000', 10)
    if (isNaN(sal)) return
    makeoffer.mutate({ candId, offerSal: sal })
  }

  function handleStop() {
    stopMutation.mutate(undefined, {
      onSuccess: () => onClose(),
    })
  }

  function getStatusChip(cand: FrgnPlrCandidate) {
    if (cand.offerStatus?.offerSttsCd === 'PENDING') {
      return <Chip label="오퍼진행중" size="small" color="primary" />
    }
    switch (cand.cntrctSttsCd) {
      case 'SIGNED':
        return <Chip label={`계약완료${cand.sgndTmNm ? ` (${cand.sgndTmNm})` : ''}`} size="small" color="success" />
      case 'AI_SIGNED':
        return <Chip label={`타팀계약${cand.sgndTmNm ? ` (${cand.sgndTmNm})` : ''}`} size="small" sx={{ bgcolor: 'orange', color: 'white' }} />
      default:
        return <Chip label="계약가능" size="small" />
    }
  }

  function renderOfferCell(cand: FrgnPlrCandidate) {
    const isAvail = cand.cntrctSttsCd === 'AVAIL'
    const isPending = cand.offerStatus?.offerSttsCd === 'PENDING'
    const maxReached = signedCount >= maxFrgnPlr

    if (isPending) {
      return <Typography variant="caption" sx={{ color: 'primary.main' }}>오퍼진행중</Typography>
    }
    if (!isAvail) return null

    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', minWidth: 160 }}>
        <TextField
          size="small"
          variant="outlined"
          type="number"
          placeholder={String(cand.wantSal)}
          value={offerSals[cand.candId] ?? ''}
          onChange={(e) =>
            setOfferSals((prev) => ({ ...prev, [cand.candId]: e.target.value }))
          }
          sx={{ width: 90 }}
          slotProps={{ htmlInput: { min: 1 } }}
        />
        <Typography variant="caption" sx={{ flexShrink: 0 }}>만원</Typography>
        <Button
          size="small"
          variant="contained"
          disabled={maxReached || makeoffer.isPending}
          onClick={() => handleOffer(cand.candId)}
        >
          오퍼
        </Button>
      </Box>
    )
  }

  function statVal(stats: Record<string, number>, key: string, decimals?: number): string {
    const v = stats?.[key]
    if (v == null) return '-'
    return decimals != null ? Number(v).toFixed(decimals) : String(v)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="h6" component="span">외국인 선수 계약</Typography>
          <Chip
            label={`현재 ${signedCount}명 / 최대 ${maxFrgnPlr}명`}
            color={signedCount >= maxFrgnPlr ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Button variant="outlined" color="error" onClick={handleStop} disabled={stopMutation.isPending}>
          그만하기
        </Button>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {makeoffer.isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            오퍼 전송에 실패했습니다.
          </Alert>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`투수 (${pitchers.length}명)`} />
          <Tab label={`타자 (${batters.length}명)`} />
        </Tabs>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ m: 2 }}>후보 데이터를 불러오지 못했습니다.</Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>이름</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>국적</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">나이</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>포지션</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>이전리그</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">종합</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">잠재</TableCell>
                  {tab === 0 ? (
                    <>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">ERA</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">IP</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">W</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">L</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">SO</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">WHIP</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">AVG</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">HR</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">RBI</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">OBP</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">SLG</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="right">SB</TableCell>
                    </>
                  )}
                  <TableCell sx={{ fontWeight: 'bold' }}>희망연봉</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 180 }}>연봉오퍼</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>계약상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentList.map((cand) => (
                  <TableRow key={cand.candId} hover>
                    <TableCell>{cand.plrNm}</TableCell>
                    <TableCell>{cand.ntlyCd}</TableCell>
                    <TableCell align="right">{cand.age}</TableCell>
                    <TableCell>{cand.reprPosnCd}</TableCell>
                    <TableCell>{cand.prvLgNm}</TableCell>
                    <TableCell align="right">{cand.ovrl}</TableCell>
                    <TableCell align="right">{cand.potAblt}</TableCell>
                    {tab === 0 ? (
                      <>
                        <TableCell align="right">{statVal(cand.stats, 'ERA', 2)}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'IP', 1)}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'W')}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'L')}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'SO')}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'WHIP', 2)}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align="right">{statVal(cand.stats, 'AVG', 3)}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'HR')}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'RBI')}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'OBP', 3)}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'SLG', 3)}</TableCell>
                        <TableCell align="right">{statVal(cand.stats, 'SB')}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Typography variant="caption" noWrap title={formatSalary(cand.wantSal).tooltip}>
                        {formatSalary(cand.wantSal).display}
                      </Typography>
                    </TableCell>
                    <TableCell>{renderOfferCell(cand)}</TableCell>
                    <TableCell>{getStatusChip(cand)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  )
}
