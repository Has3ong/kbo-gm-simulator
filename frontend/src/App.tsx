import { useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip } from '@mui/material'
import { useInitTeamMeta } from './hooks/useTeamMeta'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import BugReportIcon from '@mui/icons-material/BugReport'
import HomeIcon from '@mui/icons-material/Home'
import TeamsPage from './pages/team/TeamsPage'
import TeamDetailPage from './pages/team/TeamDetailPage'
import PlayerDetailPage from './pages/player/PlayerDetailPage'
import RosterPage from './pages/roster/RosterPage'
import StandingsPage from './pages/standings/StandingsPage'
import SeasonPage from './pages/season/SeasonPage'
import RosterConfirmPage from './pages/season/RosterConfirmPage'
import StaffPage from './pages/staff/StaffPage'
import LandingPage from './pages/home/LandingPage'
import NewGamePage from './pages/home/NewGamePage'
import SettingsPage from './pages/settings/SettingsPage'
import ScheduleCalendarModal from './components/ScheduleCalendarModal'
import DraftPage from './pages/draft/DraftPage'
import DraftEventPage from './pages/draft/DraftEventPage'
import DevPage from './pages/dev/DevPage'
import PlayerSearchPage from './pages/player/PlayerSearchPage'

const NAV_ITEMS = [
  { label: '구단', path: '/teams' },
  { label: '선수/로스터', path: '/roster' },
  { label: '선수 검색', path: '/search' },
  { label: '순위표', path: '/standings' },
  { label: '스태프', path: '/staff' },
]

const FULLSCREEN_PATHS = ['/', '/new-game', '/draft-event', '/roster-confirm']

function TeamMetaLoader() {
  useInitTeamMeta()
  return null
}

export default function App() {
  const location = useLocation()
  const isFullscreen = FULLSCREEN_PATHS.includes(location.pathname)
  const [calendarOpen, setCalendarOpen] = useState(false)

  if (isFullscreen) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/new-game" element={<NewGamePage />} />
        <Route path="/draft-event" element={<DraftEventPage />} />
        <Route path="/roster-confirm" element={<RosterConfirmPage />} />
      </Routes>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TeamMetaLoader />
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', mr: 2, flexShrink: 0 }}
          >
            KBO 단장 시뮬레이터
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
            <Tooltip title="시즌">
              <IconButton
                component={Link}
                to="/season"
                sx={{
                  color: location.pathname.startsWith('/season') ? 'white' : 'rgba(255,255,255,0.75)',
                  '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  color: location.pathname.startsWith(item.path) ? 'white' : 'rgba(255,255,255,0.75)',
                  fontWeight: location.pathname.startsWith(item.path) ? 'bold' : 'normal',
                  '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="경기 일정">
              <IconButton
                onClick={() => setCalendarOpen(true)}
                sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: 'white' } }}
              >
                <CalendarMonthIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="개발자 도구">
              <IconButton
                component={Link}
                to="/dev"
                sx={{
                  color: location.pathname === '/dev' ? 'white' : 'rgba(255,255,255,0.85)',
                  '&:hover': { color: 'white' },
                }}
              >
                <BugReportIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Routes>
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:tmId" element={<TeamDetailPage />} />
          <Route path="/players" element={<Navigate to="/roster" replace />} />
          <Route path="/players/:plrId" element={<PlayerDetailPage />} />
          <Route path="/roster" element={<RosterPage />} />
          <Route path="/standings" element={<StandingsPage />} />
          <Route path="/season" element={<SeasonPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/search" element={<PlayerSearchPage />} />
          <Route path="/draft" element={<DraftPage />} />
          <Route path="/dev" element={<DevPage />} />
        </Routes>
      </Container>

      <ScheduleCalendarModal open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </Box>
  )
}
