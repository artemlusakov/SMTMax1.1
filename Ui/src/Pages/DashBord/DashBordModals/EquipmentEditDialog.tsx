import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  SelectChangeEvent
} from "@mui/material";

interface EquipmentEditForm {
  name: string;
  image: string;
  status: string;
  efficiency: string;
  temperature: string;
  output: string;
  errors: string;
}

interface EquipmentEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: EquipmentEditForm;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => void;
}

export const EquipmentEditDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  formData, 
  onFormChange 
}: EquipmentEditDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Редактирование оборудования</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Название"
            name="name"
            value={formData.name}
            onChange={onFormChange}
            fullWidth
          />
          <TextField
            label="URL изображения"
            name="image"
            value={formData.image}
            onChange={onFormChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Статус"
              onChange={onFormChange}
            >
              <MenuItem value="1">Работает</MenuItem>
              <MenuItem value="0">Не работает</MenuItem>
              <MenuItem value="2">На обслуживании</MenuItem>
              <MenuItem value="3">Авария</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Эффективность (%)"
            name="efficiency"
            type="number"
            value={formData.efficiency}
            onChange={onFormChange}
            fullWidth
            inputProps={{ min: 0, max: 100 }}
          />
          <TextField
            label="Температура (°C)"
            name="temperature"
            type="number"
            value={formData.temperature}
            onChange={onFormChange}
            fullWidth
          />
          <TextField
            label="Выработка (ед/час)"
            name="output"
            type="number"
            value={formData.output}
            onChange={onFormChange}
            fullWidth
          />
          <TextField
            label="Ошибки"
            name="errors"
            type="number"
            value={formData.errors}
            onChange={onFormChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onSubmit} variant="contained">Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};