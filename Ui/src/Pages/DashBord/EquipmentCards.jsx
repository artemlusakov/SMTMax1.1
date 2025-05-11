import { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, CardMedia, Typography, LinearProgress, 
  Chip, Tooltip, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, 
  InputLabel, FormControl 
} from "@mui/material";
import { motion } from 'framer-motion';
import { Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  '0': { text: 'Не работает', color: 'info' },
  '1': { text: 'Работает', color: 'success' },
  '2': { text: 'На обслуживании', color: 'warning' },
  '3': { text: 'Авария', color: 'error' },
  default: { text: 'Неизвестно', color: 'default' }
};

const initialData = [
  { id: 'e133415', name: "Линия пайки SMT-1", image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg", stats: { isWorking: '0', status: '1', efficiency: '90', temperature: '245°C', output: '2000 ед/час', errors: '10' } },
  { id: 'e133416', name: "Линия пайки SMT-2", image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg", stats: { isWorking: '1', status: '2', efficiency: '45', temperature: '30°C', output: '0 ед/час', errors: '0' } },
  { id: 'e133417', name: "Линия пайки SMT-3", image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg", stats: { isWorking: '0', status: '3', efficiency: '0', temperature: '25°C', output: '0 ед/час', errors: '25' } },
  { id: 'e133418', name: "Линия пайки SMT-4", image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg", stats: { isWorking: '1', status: '1', efficiency: '85', temperature: '242°C', output: '1800 ед/час', errors: '3' } },
  { id: 'e133419', name: "Конвейерная линия", image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg", stats: { isWorking: '0', status: '0', efficiency: '0', temperature: '22°C', output: '0 ед/час', errors: '0' } }
];

export default function EquipmentCards({ setEquipmentData, equipmentData, isAdmin, onDelete }) {
  const [data, setData] = useState([]);
  const [modals, setModals] = useState({ edit: false, delete: false });
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const newData = equipmentData?.length > 0 ? equipmentData : initialData;
    setData(newData);
    setEquipmentData?.(newData);
  }, [equipmentData, setEquipmentData]);

  const handleViewStatistics = (id) => navigate(`/Statistics/${id}`);

  const handleEditClick = (equip) => {
    setCurrentEquipment(equip);
    setEditForm({
      name: equip.name,
      image: equip.image,
      status: equip.stats.status,
      efficiency: equip.stats.efficiency.replace(/\D/g, ''),
      temperature: equip.stats.temperature.replace(/\D/g, ''),
      output: equip.stats.output.replace(/\D/g, ''),
      errors: equip.stats.errors
    });
    setModals({ ...modals, edit: true });
  };

  const handleModalAction = (type, action) => {
    if (type === 'delete' && action === 'confirm') onDelete(currentEquipment);
    setModals({ ...modals, [type]: false });
    if (action !== 'confirm') setCurrentEquipment(null);
  };

  const handleEditSubmit = () => {
    const updatedData = data.map(equip => equip.id === currentEquipment.id ? {
      ...equip,
      name: editForm.name,
      image: editForm.image,
      stats: {
        isWorking: editForm.status === '1' ? '1' : '0',
        status: editForm.status,
        efficiency: editForm.efficiency,
        temperature: `${editForm.temperature}°C`,
        output: `${editForm.output} ед/час`,
        errors: editForm.errors
      }
    } : equip);

    setData(updatedData);
    setEquipmentData(updatedData);
    setModals({ ...modals, edit: false });
  };

  const handleChange = (e) => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'space-between' }}>
        {data.map((equip, index) => (
          <motion.div key={equip.id} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <Card sx={{ minWidth: 300, flex: '1 1 300px', height: '100%', boxShadow: 3, borderRadius: 2, overflow: 'hidden', position: 'relative', '&:hover': { transform: 'translateY(-5px)', transition: 'transform 0.3s ease' } }}>
              {isAdmin && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', gap: 1 }}>
                  <IconButton aria-label="edit" color="primary" sx={{ backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'primary.light' } }} onClick={() => handleEditClick(equip)}>
                    <Edit />
                  </IconButton>
                  <IconButton aria-label="delete" color="error" sx={{ backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'error.light' } }} onClick={() => { setCurrentEquipment(equip.id); setModals({ ...modals, delete: true }); }}>
                    <Delete />
                  </IconButton>
                </Box>
              )}
              
              <CardMedia component="img" height="180" image={equip.image} alt={equip.name} sx={{ objectFit: 'cover', transition: 'opacity 0.3s', '&:hover': { opacity: 0.9 } }} />
              
              <CardContent>
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{equip.name}</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>Статус:</Typography>
                  <Chip label={statusConfig[equip.stats.status]?.text || statusConfig.default.text} 
                    color={statusConfig[equip.stats.status]?.color || statusConfig.default.color} 
                    size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
                
                <Tooltip title="Процент эффективности работы оборудования" arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Эффективность:</Typography>
                    <LinearProgress variant="determinate" value={parseInt(equip.stats.efficiency)} sx={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: 'grey.200', '& .MuiLinearProgress-bar': { backgroundColor: equip.stats.status === "1" ? 'success.main' : 'warning.main' } }} />
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>{equip.stats.efficiency}%</Typography>
                  </Box>
                </Tooltip>
                
                {['temperature', 'output', 'errors'].map(field => (
                  <Box key={field} sx={{ mb: field === 'errors' ? 2 : 1 }}>
                    <Typography color={field === 'errors' && parseInt(equip.stats[field]) > 5 ? 'error.main' : 'inherit'} variant="body1">
                      <strong>{field === 'temperature' ? 'Температура' : field === 'output' ? 'Выработка' : 'Ошибки'}:</strong> {equip.stats[field]}
                    </Typography>
                  </Box>
                ))}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" sx={{ flex: 1 }} onClick={() => handleViewStatistics(equip.id)}>Статистика</Button>
                  {isAdmin && <Button variant="outlined" color="secondary" sx={{ flex: 1 }} onClick={() => handleEditClick(equip)}>Редактировать</Button>}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      <Dialog open={modals.edit} onClose={() => setModals({ ...modals, edit: false })}>
        <DialogTitle>Редактирование оборудования</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField label="Название" name="name" value={editForm.name} onChange={handleChange} fullWidth />
          <TextField label="URL изображения" name="image" value={editForm.image} onChange={handleChange} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select name="status" value={editForm.status} label="Статус" onChange={handleChange}>
              {Object.entries(statusConfig).filter(([key]) => key !== 'default').map(([value, { text }]) => (
                <MenuItem key={value} value={value}>{text}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {['efficiency', 'temperature', 'output', 'errors'].map(field => (
            <TextField key={field} label={field === 'efficiency' ? 'Эффективность (%)' : field === 'temperature' ? 'Температура (°C)' : field === 'output' ? 'Выработка (ед/час)' : 'Ошибки'} 
              name={field} type="number" value={editForm[field]} onChange={handleChange} fullWidth 
              inputProps={field === 'efficiency' ? { min: 0, max: 100 } : {}} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModals({ ...modals, edit: false })}>Отмена</Button>
          <Button onClick={handleEditSubmit} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modals.delete} onClose={() => setModals({ ...modals, delete: false })}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent><Typography>Вы точно хотите удалить оборудование с ID {currentEquipment}?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setModals({ ...modals, delete: false })}>Отмена</Button>
          <Button onClick={() => handleModalAction('delete', 'confirm')} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}