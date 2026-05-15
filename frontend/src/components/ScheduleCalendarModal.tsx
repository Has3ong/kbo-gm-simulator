import { useState, useMemo, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography,
  Grid, Chip, Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useGames } from '../hooks/useGames'
import { useSeason } from '../hooks/useSeasons'
import { useGame } from '../contexts/GameContext'
import { CURRENT_SEASON_YEAR, teamLogoSrc } from '../constants'
import type { Game } from '../types/game'

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

interface Props {
  open: boolean
  onClose: () => void
}

export default function ScheduleCalendarModal({ open, onClose }: Props) {
  const { currentGame } = useGame()
  const ssntYr = currentGame?.ssntYr ?? CURRENT_SEASON_YEAR
  const userTeamId = currentGame?.userTeamId ?? null

  const { data: season } = useSeason(ssntYr)

  // 게임의 현재 날짜(curDt) 기준으로 초기 월 설정
  const gameMonth = useMemo(() => {
    if (season?.curDt) {
      return Number(season.curDt.slice(5, 7))
    }
    return new Date().getMonth() + 1
  }, [season?.curDt])

  const [month, setMonth] = useState(gameMonth)

  useEffect(() => {
    if (open) setMonth(gameMonth)
  }, [open, gameMonth])

  // tmId를 백엔드로 전달하여 유저 팀 경기만 조회
  const { data: games = [] } = useGames({
    ssntYr,
    mon: month,
    ...(userTeamId != null ? { tmId: userTeamId } : {}),
  })

  const gamesByDate = useMemo(() => {
    const map = new Map<string, Game[]>()
    games.forEach((g) => {
      const list = map.get(g.gameDt) ?? []
      list.push(g)
      map.set(g.gameDt, list)
    })
    return map
  }, [games])

  const gameDateStr = season?.curDt ?? ''

  const firstDay = new Date(ssntYr, month - 1, 1).getDay()
  const daysInMonth = new Date(ssntYr, month, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const fmt = (d: number) => `${ssntYr}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const prevMonth = () => setMonth((m) => (m === 1 ? 12 : m - 1))
  const nextMonth = () => setMonth((m) => (m === 12 ? 1 : m + 1))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={prevMonth} disabled={month === 1}><ChevronLeftIcon /></IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: 120, textAlign: 'center' }}>
              {ssntYr}년 {MONTHS[month - 1]}
            </Typography>
            <IconButton size="small" onClick={nextMonth} disabled={month === 12}><ChevronRightIcon /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {userTeamId && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {currentGame?.userTeamName} 경기
              </Typography>
            )}
            <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {/* 요일 헤더 */}
        <Grid container columns={7} sx={{ mb: 0.5 }}>
          {DOW.map((d, i) => (
            <Grid key={d} size={1}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block', textAlign: 'center', fontWeight: 'bold', py: 0.5,
                  color: i === 0 ? 'error.main' : i === 6 ? 'primary.main' : 'text.secondary',
                }}
              >
                {d}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* 날짜 그리드 */}
        <Grid container columns={7} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
          {cells.map((day, idx) => {
            const dateStr = day ? fmt(day) : ''
            const dayGames = day ? (gamesByDate.get(dateStr) ?? []) : []
            const isGameDay = dateStr === gameDateStr
            const isPast = !!dateStr && dateStr < gameDateStr
            const dow = idx % 7

            const cellBg = !day
              ? 'grey.50'
              : isGameDay
                ? 'warning.50'
                : isPast
                  ? 'rgba(0,0,0,0.03)'
                  : undefined

            return (
              <Grid
                key={idx}
                size={1}
                sx={{
                  minHeight: 110,
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid' : 'none',
                  borderBottom: idx < cells.length - 7 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  bgcolor: cellBg,
                  p: 0.5,
                }}
              >
                {day && (
                  <>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block', textAlign: 'right', fontWeight: isGameDay ? 'bold' : 'normal',
                        color: isGameDay ? 'white'
                          : isPast ? 'text.disabled'
                            : dow === 0 ? 'error.main'
                              : dow === 6 ? 'primary.main'
                                : 'text.primary',
                        bgcolor: isGameDay ? 'warning.main' : 'transparent',
                        borderRadius: '50%', width: 20, height: 20, lineHeight: '20px',
                        ml: 'auto', mb: 0.25,
                      }}
                    >
                      {day}
                    </Typography>
                    {dayGames.slice(0, 3).map((g) => (
                      <GameChip key={g.gameId} game={g} isPast={isPast} userTeamId={userTeamId} />
                    ))}
                    {dayGames.length > 3 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
                        +{dayGames.length - 3}경기
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
            )
          })}
        </Grid>

        <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>승리</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'error.light', borderRadius: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>패배</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'grey.400', borderRadius: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>무승부</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'grey.200', borderRadius: 0.5, border: '1px solid', borderColor: 'grey.300' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>예정</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'warning.50', borderRadius: 0.5, border: '1px solid', borderColor: 'warning.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>오늘</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

function GameChip({ game: g, isPast, userTeamId }: { game: Game; isPast: boolean; userTeamId: number | null }) {
  const isFinished = g.gameSttsCd === '03'
  const isHome = userTeamId != null && g.homeTmId === userTeamId

  // 결과에 따른 배경색
  let cardBg = isPast && !isFinished ? 'grey.100' : 'grey.50'
  let borderColor = 'divider'

  if (isFinished && userTeamId != null && g.homeScore != null && g.awayScore != null) {
    const userScore = isHome ? g.homeScore : g.awayScore
    const oppScore = isHome ? g.awayScore : g.homeScore
    if (userScore > oppScore) {
      cardBg = 'success.50'
      borderColor = 'success.light'
    } else if (userScore < oppScore) {
      cardBg = 'error.50'
      borderColor = 'error.light'
    } else {
      cardBg = 'grey.200'
      borderColor = 'grey.400'
    }
  }

  const homeLogo = teamLogoSrc(g.homeTmId)
  const awayLogo = teamLogoSrc(g.awayTmId)

  const scoreStr =
    isFinished && g.homeScore != null && g.awayScore != null
      ? `${g.homeScore} : ${g.awayScore}`
      : null

  const tooltipTitle = isFinished
    ? `[${isHome ? '홈' : '원정'}] ${g.homeTmKrNm} vs ${g.awayTmKrNm} (${scoreStr})`
    : `[예정] ${g.homeTmKrNm} vs ${g.awayTmKrNm}${g.stdmKrNm ? ` @ ${g.stdmKrNm}` : ''}`

  return (
    <Tooltip title={tooltipTitle} arrow placement="top">
      <Box
        sx={{
          mb: 0.5,
          p: '3px 4px',
          borderRadius: 1,
          border: '1px solid',
          borderColor,
          bgcolor: cardBg,
          opacity: isPast && !isFinished ? 0.6 : 1,
          cursor: 'default',
        }}
      >
        {/* 홈/원정 뱃지 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '2px' }}>
          <Chip
            label={isHome ? '홈' : '원정'}
            size="small"
            sx={{
              height: 13,
              fontSize: '0.55rem',
              fontWeight: 'bold',
              bgcolor: isHome ? 'primary.main' : 'secondary.main',
              color: 'white',
              '& .MuiChip-label': { px: '4px' },
            }}
          />
          {isFinished && scoreStr && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6rem',
                fontWeight: 'bold',
                color:
                  g.homeScore != null && g.awayScore != null
                    ? (isHome ? g.homeScore : g.awayScore) > (isHome ? g.awayScore : g.homeScore)
                      ? 'success.dark'
                      : (isHome ? g.homeScore : g.awayScore) < (isHome ? g.awayScore : g.homeScore)
                        ? 'error.main'
                        : 'text.secondary'
                    : 'text.secondary',
              }}
            >
              {scoreStr}
            </Typography>
          )}
        </Box>

        {/* 홈팀 로고 + vs + 원정팀 로고 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
          {homeLogo ? (
            <Box
              component="img"
              src={homeLogo}
              alt={g.homeTmKrNm}
              sx={{ width: 18, height: 18, objectFit: 'contain' }}
            />
          ) : (
            <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 'bold' }}>
              {abbr(g.homeTmKrNm)}
            </Typography>
          )}
          <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', lineHeight: 1 }}>
            vs
          </Typography>
          {awayLogo ? (
            <Box
              component="img"
              src={awayLogo}
              alt={g.awayTmKrNm}
              sx={{ width: 18, height: 18, objectFit: 'contain' }}
            />
          ) : (
            <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 'bold' }}>
              {abbr(g.awayTmKrNm)}
            </Typography>
          )}
        </Box>

        {/* 팀명 표시 */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            fontSize: '0.55rem',
            color: 'text.secondary',
            lineHeight: 1.2,
            mt: '1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {abbr(g.homeTmKrNm)} vs {abbr(g.awayTmKrNm)}
        </Typography>
      </Box>
    </Tooltip>
  )
}

function abbr(nm: string): string {
  if (!nm) return '?'
  const short: Record<string, string> = {
    'KIA 타이거즈': 'KIA', '삼성 라이온즈': '삼성', 'LG 트윈스': 'LG',
    '두산 베어스': '두산', 'KT 위즈': 'KT', 'SSG 랜더스': 'SSG',
    '롯데 자이언츠': '롯데', '한화 이글스': '한화', 'NC 다이노스': 'NC',
    '키움 히어로즈': '키움',
  }
  return short[nm] ?? nm.slice(0, 2)
}
