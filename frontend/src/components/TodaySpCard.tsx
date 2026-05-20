import { useState } from 'react'
import {
  Box, Typography, Button, Popover, List, ListItemText,
  ListItemSecondaryAction, Chip, CircularProgress, Tooltip, ListItem,
} from '@mui/material'
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball'
import { useRotationPitchers } from '../hooks/useGames'

interface Props {
  ssntYr: number
  userTmId: number
}

export default function TodaySpCard({ ssntYr, userTmId }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const { data: rotation = [], isLoading } = useRotationPitchers(userTmId, ssntYr)

  return (
    <>
      <Tooltip title="선발 로테이션 확인" arrow>
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          startIcon={<SportsBaseballIcon fontSize="small" />}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ fontSize: 12, borderColor: 'divider', color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          선발 로테이션
        </Button>
      </Tooltip>

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, minWidth: 240 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            선발 로테이션
          </Typography>
          {isLoading ? (
            <CircularProgress size={20} />
          ) : rotation.length === 0 ? (
            <Typography variant="body2" color="text.secondary">로테이션 정보 없음</Typography>
          ) : (
            <List dense disablePadding>
              {rotation.map((p) => (
                <ListItem key={p.plrId} sx={{ borderRadius: 1 }}>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 'medium' }}>{p.plrNm}</Typography>}
                    secondary={`구속 ${p.vel ?? '-'} / 제구 ${p.ctl ?? '-'} / 체력 ${p.stm ?? '-'}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={`${p.rotOrd}선발`} size="small" sx={{ fontSize: 10, height: 18 }} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  )
}
