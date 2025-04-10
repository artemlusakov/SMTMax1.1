import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface FormData {
  link: string;
  size: string;
  name: string;
  title: string;
  value: number;
}

interface AddElementWindowProps {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string | number) => void;
  onSave: () => void;
}

const AddElementWindow = ({
  open,
  onClose,
  formData,
  onFormChange,
  onSave
}: AddElementWindowProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Добавить оборудование</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Название"
          fullWidth
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          sx={{ mb: 2 }}
        />

          <TextField
            margin="dense"
            label="Заголовок"
            fullWidth
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Значение"
            type="number"
            fullWidth
            value={formData.value}
            onChange={(e) => onFormChange('value', Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Размер"
            select
            fullWidth
            value={formData.size}
            onChange={(e) => onFormChange('size', e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="element-card">Обычный</option>
            <option value="element-card-wide">Широкий</option>
          </TextField>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddElementWindow;