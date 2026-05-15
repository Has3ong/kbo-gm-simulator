import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Grid, Card, CardContent,
  CardActionArea, Chip, Alert, CircularProgress, IconButton, Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'
import { useSpringCampLocations, useSelectSpringCamp } from '../hooks/useSpringCamp'
import { useTeamFinance } from '../hooks/useTeams'
import { useGame } from '../contexts/GameContext'
import { formatSalary } from '../utils/format'
import { CURRENT_SEASON_YEAR } from '../constants'
import type { SpringCampLocation } from '../types/staff'

interface Props {
  open: boolean
  onClose: () => void
  onSelected: () => void
}

const TIER_COLORS: Record<number, 'default' | 'info' | 'primary' | 'secondary' | 'warning' | 'error'> = {
  1: 'default', 2: 'info', 3: 'primary', 4: 'secondary', 5: 'warning', 6: 'warning', 7: 'error',
}

function GrowthBar({ label, value, max = 6 }: { label: string; value: number; max?: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography variant="caption" sx={{ width: 80, color: 'text.secondary', flexShrink: 0 }}>{label}</Typography>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {Array.from({ length: max }).map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 10, height: 10, borderRadius: 1,
              bgcolor: i < value ? 'primary.main' : 'action.disabled',
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{value}</Typography>
    </Box>
  )
}

function LocationCard({
  loc,
  selected,
  disabled,
  onSelect,
}: {
  loc: SpringCampLocation
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const card = (
    <Card
      variant="outlined"
      sx={{
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : disabled ? 'action.disabledBackground' : 'divider',
        bgcolor: selected
          ? 'rgba(25,118,210,0.04)'
          : disabled
            ? 'action.disabledBackground'
            : 'background.paper',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.15s',
      }}
    >
      <CardActionArea onClick={disabled ? undefined : onSelect} disabled={disabled} sx={{ p: 0 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{loc.name}</Typography>
            <Chip label={`Tier ${loc.tier}`} color={TIER_COLORS[loc.tier]} size="small" />
          </Box>
          <Typography variant="h6" sx={{ color: disabled ? 'text.disabled' : 'primary.main', fontWeight: 'bold', mb: 1.5 }}>
            {(loc.cost / 10000).toLocaleString()}억원
          </Typography>
          <GrowthBar label="성장 능력치 수" value={loc.growthAbltCount} />
          <GrowthBar label="최대 성장치" value={loc.maxGrowthPerAblt} max={4} />
        </CardContent>
      </CardActionArea>
    </Card>
  )

  if (disabled) {
    return (
      <Tooltip title="구단 잔고가 부족합니다" arrow>
        <span style={{ display: 'block' }}>{card}</span>
      </Tooltip>
    )
  }
  return card
}

export default function SpringCampModal({ open, onClose, onSelected }: Props) {
  const { data: locations = [], isLoading } = useSpringCampLocations()
  const selectMutation = useSelectSpringCamp()
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  const { currentGame } = useGame()
  const userTmId = currentGame?.userTeamId ?? null
  const { data: finance } = useTeamFinance(userTmId ?? 0, CURRENT_SEASON_YEAR)
  const currentCash = finance?.curCash ?? null

  function handleConfirm() {
    if (!selectedCode) return
    selectMutation.mutate(selectedCode, {
      onSuccess: () => {
        onSelected()
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          스프링 캠프 선택
          {currentCash !== null && (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'normal', mt: 0.25 }}>
              구단 잔고: <strong style={{ color: currentCash >= 0 ? 'inherit' : '#d32f2f' }}>{formatSalary(currentCash).display}</strong>
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          스프링 캠프를 선택하면 소속 선수 전원의 능력치가 성장합니다.
          높은 등급의 캠프일수록 비용이 높지만 선수 성장이 큽니다.
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {locations.map((loc) => {
              const isOverBudget = currentCash !== null && loc.cost > currentCash
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={loc.code}>
                  <LocationCard
                    loc={loc}
                    selected={selectedCode === loc.code}
                    disabled={isOverBudget}
                    onSelect={() => setSelectedCode(loc.code)}
                  />
                </Grid>
              )
            })}
          </Grid>
        )}
        {selectMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(selectMutation.error as Error)?.message ?? '캠프 선택에 실패했습니다.'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedCode || selectMutation.isPending}
        >
          {selectMutation.isPending ? <CircularProgress size={20} /> : '선택 완료'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
