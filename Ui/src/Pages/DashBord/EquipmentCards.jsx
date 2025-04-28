import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  LinearProgress, 
  Chip, 
  Tooltip, 
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const getStatusText = (statusCode) => {
  switch(statusCode) {
    case '0': return 'Не работает';
    case '1': return 'Работает';
    case '2': return 'На обслуживании';
    case '3': return 'Авария';
    default: return 'Неизвестно';
  }
};

const getStatusColor = (statusCode) => {
  switch(statusCode) {
    case '1': return 'success';
    case '2': return 'warning';
    case '0': return 'info';
    case '3': return 'error';
    default: return 'default';
  }
};

// Начальные данные оборудования (все статичные)
const initialData = [
  {
    id: 'e133415',
    name: "Линия пайки SMT-1",
    image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
    stats: {
      isWorking: '0',
      status: '1',
      efficiency: '90',
      temperature: '245°C',
      output: '2000 ед/час',
      errors: '10'
    }
  },
  {
    id: 'e133416',
    name: "Линия пайки SMT-2",
    image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
    stats: {
      isWorking: '1',
      status: '2',
      efficiency: '45',
      temperature: '30°C',
      output: '0 ед/час',
      errors: '0'
    }
  },
  {
    id: 'e133417',
    name: "Линия пайки SMT-3",
    image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
    stats: {
      isWorking: '0',
      status: '3',
      efficiency: '0',
      temperature: '25°C',
      output: '0 ед/час',
      errors: '25'
    }
  },
  {
    id: 'e133418',
    name: "Линия пайки SMT-4",
    image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
    stats: {
      isWorking: '1',
      status: '1',
      efficiency: '85',
      temperature: '242°C',
      output: '1800 ед/час',
      errors: '3'
    }
  },
  {
    id: 'e133419',
    name: "Конвейерная линия",
    image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
    stats: {
      isWorking: '0',
      status: '0',
      efficiency: '0',
      temperature: '22°C',
      output: '0 ед/час',
      errors: '0'
    }
  }
];

export default function EquipmentCards({ 
  setEquipmentData, 
  equipmentData, 
  isAdmin, 
  onDelete 
}) {
  const [data, setData] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    image: '',
    status: '1',
    efficiency: '',
    temperature: '',
    output: '',
    errors: ''
  });
  const navigate = useNavigate();

  // Инициализация данных из пропсов или из initialData
  useEffect(() => {
    if (equipmentData && equipmentData.length > 0) {
      setData(equipmentData);
    } else {
      setData(initialData);
      setEquipmentData(initialData);
    }
  }, [equipmentData, setEquipmentData]);

  const handleViewStatistics = (id) => {
    navigate(`/Statistics/${id}`);
  };

  const handleEditClick = (equip) => {
    setCurrentEquipment(equip);
    setEditForm({
      name: equip.name,
      image: equip.image,
      status: equip.stats.status,
      efficiency: equip.stats.efficiency.replace('%', '').replace(' ед/час', ''),
      temperature: equip.stats.temperature.replace('°C', ''),
      output: equip.stats.output.replace(' ед/час', ''),
      errors: equip.stats.errors
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    const updatedData = data.map(equip => {
      if (equip.id === currentEquipment.id) {
        return {
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
        };
      }
      return equip;
    });

    setData(updatedData);
    setEquipmentData(updatedData);
    setEditModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
        justifyContent: 'space-between'
      }}>
        {data.map((equip, index) => (
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
              '&:hover': {
                transform: 'translateY(-5px)',
                transition: 'transform 0.3s ease'
              }
            }}>
              {isAdmin && (
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                  display: 'flex',
                  gap: 1
                }}>
                  <IconButton
                    aria-label="edit"
                    color="primary"
                    sx={{
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'primary.light'
                      }
                    }}
                    onClick={() => handleEditClick(equip)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    color="error"
                    sx={{
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'error.light'
                      }
                    }}
                    onClick={() => onDelete(equip.id)}
                  >
                    <DeleteIcon />
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
                  '&:hover': {
                    opacity: 0.9
                  }
                }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {equip.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>Статус:</Typography>
                  <Chip 
                    label={getStatusText(equip.stats.status)} 
                    color={getStatusColor(equip.stats.status)} 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Tooltip title="Процент эффективности работы оборудования" arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Эффективность:</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseInt(equip.stats.efficiency)} 
                      sx={{ 
                        width: '100%',
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: equip.stats.status === "1" ? 'success.main' : 'warning.main'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                      {equip.stats.efficiency}%
                    </Typography>
                  </Box>
                </Tooltip>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Температура:</strong> {equip.stats.temperature}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Выработка:</strong> {equip.stats.output}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    color={parseInt(equip.stats.errors) > 5 ? 'error.main' : 'text.secondary'}
                    variant="body1"
                  >
                    <strong>Ошибки:</strong> {equip.stats.errors}
                  </Typography>
                </Box>
                
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
        ))}
      </Box>

      {/* Модальное окно редактирования */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Редактирование оборудования</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              label="URL изображения"
              name="image"
              value={editForm.image}
              onChange={handleEditChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                name="status"
                value={editForm.status}
                label="Статус"
                onChange={handleEditChange}
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
              value={editForm.efficiency}
              onChange={handleEditChange}
              fullWidth
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              label="Температура (°C)"
              name="temperature"
              type="number"
              value={editForm.temperature}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              label="Выработка (ед/час)"
              name="output"
              type="number"
              value={editForm.output}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              label="Ошибки"
              name="errors"
              type="number"
              value={editForm.errors}
              onChange={handleEditChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
          <Button onClick={handleEditSubmit} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}