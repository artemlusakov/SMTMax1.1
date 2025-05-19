import { useState } from 'react';
import { 
  Box, Card, CardContent, CardMedia, Typography, LinearProgress, 
  Chip, Tooltip, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, 
  InputLabel, FormControl, Alert
} from "@mui/material";
import { motion } from 'framer-motion';
import { Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Equipment {
  id: string;
  name: string;
  image: string;
  isWorking?: string;
  status?: string;
  efficiency?: string;
  temperature?: string;
  output?: string;
  errors?: string;
  stats?: {
    isWorking: string;
    status: string;
    efficiency: string;
    temperature: string;
    output: string;
    errors: string;
  };
}

interface StatusConfig {
  [key: string]: {
    text: string;
    color: 'info' | 'success' | 'warning' | 'error' | 'default';
  };
}

interface EquipmentCardsProps {
  equipmentData: Equipment[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit: (equipment: Equipment) => void;
}

const statusConfig: StatusConfig = {
  '0': { text: 'Не работает', color: 'info' },
  '1': { text: 'Работает', color: 'success' },
  '2': { text: 'На обслуживании', color: 'warning' },
  '3': { text: 'Авария', color: 'error' },
  default: { text: 'Неизвестно', color: 'default' }
};

export default function EquipmentCards({ 
  equipmentData, 
  isAdmin, 
  onDelete, 
  onEdit 
}: EquipmentCardsProps) {
  const [modals, setModals] = useState({
    edit: false,
    delete: false
  });
  const [currentEquipment, setCurrentEquipment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Equipment, 'stats'>>({
    id: '',
    name: '',
    image: '',
    isWorking: '1',
    status: '1',
    efficiency: '0',
    temperature: '0',
    output: '0',
    errors: '0'
  });
  const navigate = useNavigate();

  const handleViewStatistics = (id: string) => navigate(`/Statistics/${id}`);

  const handleEditClick = (equip: Equipment) => {
    setCurrentEquipment(equip.id);
    setEditForm({
      id: equip.id,
      name: equip.name,
      image: equip.image,
      isWorking: equip.isWorking || equip.stats?.isWorking || '1',
      status: equip.status || equip.stats?.status || '1',
      efficiency: (equip.efficiency || equip.stats?.efficiency || '0').replace(/\D/g, ''),
      temperature: (equip.temperature || equip.stats?.temperature || '0').replace(/\D/g, ''),
      output: (equip.output || equip.stats?.output || '0').replace(/\D/g, ''),
      errors: equip.errors || equip.stats?.errors || '0'
    });
    setModals({ ...modals, edit: true });
  };

  const handleModalAction = (type: 'edit' | 'delete', action: 'confirm' | 'cancel') => {
    if (type === 'delete' && action === 'confirm' && currentEquipment) {
      onDelete(currentEquipment);
    }
    setModals({ ...modals, [type]: false });
  };

  const handleEditSubmit = () => {
    const updatedEquipment: Equipment = {
      id: editForm.id,
      name: editForm.name,
      image: editForm.image,
      isWorking: editForm.status === '1' ? '1' : '0',
      status: editForm.status,
      efficiency: editForm.efficiency,
      temperature: `${editForm.temperature}°C`,
      output: `${editForm.output} ед/час`,
      errors: editForm.errors
    };
    
    onEdit(updatedEquipment);
    setModals({ ...modals, edit: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as keyof typeof editForm;
    const value = e.target.value as string;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (!equipmentData || equipmentData.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">Нет данных об оборудовании</Alert>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'space-between' }}>
        {equipmentData.map((equip, index) => {
          const status = equip.status || equip.stats?.status || '0';
          const efficiency = equip.efficiency || equip.stats?.efficiency || '0';
          const temperature = equip.temperature || equip.stats?.temperature || '0°C';
          const output = equip.output || equip.stats?.output || '0 ед/час';
          const errors = equip.errors || equip.stats?.errors || '0';

          return (
            <motion.div 
              key={equip.id} 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card sx={{ 
                minWidth: 300, 
                flex: '1 1 300px', 
                height: '100%', 
                boxShadow: 3, 
                borderRadius: 2, 
                overflow: 'hidden', 
                position: 'relative', 
                '&:hover': { transform: 'translateY(-5px)', transition: 'transform 0.3s ease' } 
              }}>
                {isAdmin && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', gap: 1 }}>
                    <IconButton 
                      aria-label="edit" 
                      color="primary" 
                      sx={{ 
                        backgroundColor: 'background.paper', 
                        '&:hover': { backgroundColor: 'primary.light' } 
                      }} 
                      onClick={() => handleEditClick(equip)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      aria-label="delete" 
                      color="error" 
                      sx={{ 
                        backgroundColor: 'background.paper', 
                        '&:hover': { backgroundColor: 'error.light' } 
                      }} 
                      onClick={() => { 
                        setCurrentEquipment(equip.id); 
                        setModals({ ...modals, delete: true }); 
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
                
                <CardMedia 
                  component="img" 
                  height="180" 
                  image={equip.image} 
                  alt={equip.name} 
                  sx={{ 
                    objectFit: 'cover', 
                    transition: 'opacity 0.3s', 
                    '&:hover': { opacity: 0.9 } 
                  }} 
                />
                
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {equip.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Статус:</Typography>
                    <Chip 
                      label={statusConfig[status]?.text || statusConfig.default.text} 
                      color={statusConfig[status]?.color || statusConfig.default.color} 
                      size="small" 
                      sx={{ fontWeight: 'bold' }} 
                    />
                  </Box>
                  
                  <Tooltip title="Процент эффективности работы оборудования" arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ mr: 1 }}>Эффективность:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseInt(efficiency)} 
                        sx={{ 
                          width: '100%', 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: 'grey.200', 
                          '& .MuiLinearProgress-bar': { 
                            backgroundColor: status === "1" ? 'success.main' : 'warning.main' 
                          } 
                        }} 
                      />
                      <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                        {efficiency}%
                      </Typography>
                    </Box>
                  </Tooltip>
                  
                  {[
                    { field: 'temperature', label: 'Температура', value: temperature },
                    { field: 'output', label: 'Выработка', value: output },
                    { field: 'errors', label: 'Ошибки', value: errors }
                  ].map(({ field, label, value }) => (
                    <Box key={field} sx={{ mb: field === 'errors' ? 2 : 1 }}>
                      <Typography 
                        color={field === 'errors' && parseInt(value) > 5 ? 'error.main' : 'inherit'} 
                        variant="body1"
                      >
                        <strong>{label}:</strong> {value}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      sx={{ flex: 1 }} 
                      onClick={() => handleViewStatistics(equip.id)}
                    >
                      Статистика
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        sx={{ flex: 1 }} 
                        onClick={() => handleEditClick(equip)}
                      >
                        Редактировать
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </Box>

      <Dialog open={modals.edit} onClose={() => setModals({ ...modals, edit: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Редактирование оборудования</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Название"
            name="name"
            value={editForm.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="URL изображения"
            name="image"
            value={editForm.image}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Статус</InputLabel>
            <Select 
              name="status" 
              value={editForm.status} 
              label="Статус" 
              onChange={handleChange}
            >
              {Object.entries(statusConfig)
                .filter(([key]) => key !== 'default')
                .map(([value, { text }]) => (
                  <MenuItem key={value} value={value}>{text}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            label="Эффективность (%)"
            name="efficiency"
            type="number"
            value={editForm.efficiency}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Температура (°C)"
            name="temperature"
            type="number"
            value={editForm.temperature}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Выработка (ед/час)"
            name="output"
            type="number"
            value={editForm.output}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Ошибки"
            name="errors"
            type="number"
            value={editForm.errors}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModals({ ...modals, edit: false })}>Отмена</Button>
          <Button onClick={handleEditSubmit} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modals.delete} onClose={() => setModals({ ...modals, delete: false })}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Вы точно хотите удалить оборудование с ID {currentEquipment}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModals({ ...modals, delete: false })}>Отмена</Button>
          <Button 
            onClick={() => handleModalAction('delete', 'confirm')} 
            color="error" 
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}