import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent,
  CircularProgress, Alert, Chip,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import StadiumIcon from '@mui/icons-material/Stadium'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { useGame } from '../../contexts/GameContext'
import { useTeamsPage } from './TeamsPageHooks'

export default function TeamsPage() {
  const { teams, isLoading, error } = useTeamsPage()
  const { currentGame } = useGame()
  const userTeamId = currentGame?.userTeamId ?? null

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>데이터를 불러오는 중 오류가 발생했습니다.</Alert>

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>KBO 10개 구단</Typography>
      <Grid container spacing={2}>
        {teams?.map((team) => {
          const isUserTeam = team.tmId === userTeamId
          const ciClr = team.ciClr ?? '#1976d2'
          const logoSrc = team.emblemCd ? `/img/logo/${team.emblemCd}` : null

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={team.tmId}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 3 },
                  borderColor: isUserTeam ? ciClr : 'divider',
                  borderWidth: isUserTeam ? 2 : 1,
                  position: 'relative',
                }}
              >
                {isUserTeam && (
                  <Box
                    sx={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: 4, bgcolor: ciClr, borderRadius: '4px 4px 0 0',
                    }}
                  />
                )}
                <CardActionArea component={RouterLink} to={`/teams/${team.tmId}`} sx={{ height: '100%', alignItems: 'flex-start' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      {logoSrc && (
                        <Box
                          component="img"
                          src={logoSrc}
                          alt={team.tmKrNm}
                          sx={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: ciClr, mb: 0 }}>
                          {team.tmKrNm}
                        </Typography>
                        {team.tmEngNm && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {team.tmEngNm}
                          </Typography>
                        )}
                      </Box>
                      {isUserTeam && (
                        <Chip label="내 팀" size="small" sx={{ ml: 'auto', bgcolor: ciClr, color: 'white', fontWeight: 'bold', fontSize: 11 }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{team.cityNm ?? '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <StadiumIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{team.stdmKrNm ?? '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        창단 {team.tmEstblshDt?.slice(0, 4) ?? '-'}년
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
