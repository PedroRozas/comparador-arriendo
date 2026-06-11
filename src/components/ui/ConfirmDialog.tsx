import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontFamily: 'inherit', pb: 1 }}>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.9375rem' }}>
        {description}
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button variant="text" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button variant="contained" color="error" onClick={onConfirm} disabled={isLoading}>
        {isLoading ? 'Eliminando…' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
)
