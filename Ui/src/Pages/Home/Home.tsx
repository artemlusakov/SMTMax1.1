import './Home.css';
import Navigate from '../../Components/Navigate/Navigate';
import WorkingLineElement from '../Home/LineElement/WorkingLineElement';
import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField 
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Refresh as RefreshIcon 
} from '@mui/icons-material';

interface DataObject {
  id: string;
  link: string;
  size: string;
  name: string;
  title: string;
  value: number;
}

interface Metrics {
  efficiencyPercentage: number;
  attentionNeeded: number;
  errorMachineIds: string[];
  hasCriticalErrors: boolean;
  lastUpdated?: Date;
}

const fetchEquipmentData = async (): Promise<DataObject[]> => {
  try {
    const response = await fetch('http://localhost:8080/api/equipment');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching equipment data:', error);
    return [];
  }
};

export default function Home() {
  const [workingLineElements, setWorkingLineElements] = useState<DataObject[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<DataObject | null>(null);
  const [formData, setFormData] = useState<Omit<DataObject, 'id'>>({
    link: '/Statistics',
    size: 'element-card',
    name: '',
    title: '',
    value: 0
  });

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchEquipmentData();
      setWorkingLineElements(data);
      setLastUpdated(new Date());
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Выбор элементов
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  // Обновление данных
  const refreshData = async () => {
    const data = await fetchEquipmentData();
    setWorkingLineElements(data);
    setLastUpdated(new Date());
    setSelectedItems([]);
  };

  // Добавление оборудования
  const handleAdd = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: `e${Math.floor(Math.random() * 1000000)}`
        }),
      });
      
      if (response.ok) {
        await refreshData();
        setIsAddModalOpen(false);
        setFormData({
          link: '/Statistics',
          size: 'element-card',
          name: '',
          title: '',
          value: 0
        });
      }
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  // Редактирование оборудования
  const handleEdit = async () => {
    if (!currentItem) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/equipment/${currentItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentItem, ...formData }),
      });
      
      if (response.ok) {
        await refreshData();
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  // Удаление оборудования
  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await Promise.all(
        selectedItems.map(id => 
          fetch(`http://localhost:8080/api/equipment/${id}`, { method: 'DELETE' })
        )
      );
      await refreshData();
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  // Расчет метрик
  const metrics: Metrics = useMemo(() => {
    if (workingLineElements.length === 0) return {
      efficiencyPercentage: 0,
      attentionNeeded: 0,
      errorMachineIds: [],
      hasCriticalErrors: false
    };

    const elementsWithStatus = workingLineElements.map(item => ({
      ...item,
      status: item.value > 1500 ? 'error' : 
              item.value >= 1000 ? 'warning' : 'operational'
    }));

    const hasCriticalErrors = elementsWithStatus.some(item => item.status === 'error');
    const errorMachines = elementsWithStatus.filter(item => item.status === 'error');
    
    if (hasCriticalErrors) {
      return {
        efficiencyPercentage: 0,
        attentionNeeded: errorMachines.length + 
                        elementsWithStatus.filter(item => item.status === 'warning').length,
        errorMachineIds: errorMachines.map(m => m.id),
        hasCriticalErrors: true
      };
    }

    const totalValue = elementsWithStatus.reduce((sum, item) => sum + item.value, 0);
    const goodValue = elementsWithStatus
      .filter(item => item.status === 'operational')
      .reduce((sum, item) => sum + item.value, 0);
    
    const warningValue = elementsWithStatus
      .filter(item => item.status === 'warning')
      .reduce((sum, item) => sum + item.value * 0.5, 0);

    const efficiencyPercentage = totalValue > 0
      ? Math.round(((goodValue + warningValue) / totalValue) * 100)
      : 0;

    return {
      efficiencyPercentage,
      attentionNeeded: elementsWithStatus.filter(item => item.status !== 'operational').length,
      errorMachineIds: [],
      hasCriticalErrors: false,
      lastUpdated
    };
  }, [workingLineElements, lastUpdated]);

  return (
    <div className='home-container'>
      <Navigate />

      <div className='dashboard'>
        <div className='last-updated'>
          Последнее обновление: {lastUpdated.toLocaleTimeString()}
        </div>

        <div className='equipment-section'>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center', 
            width: '100%',
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            mb: 3
          }}>
            <h2 className='section-title' style={{ margin: 0 }}>Мониторинг оборудования</h2>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Обновить данные">
                <IconButton color="primary" onClick={refreshData}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                color="success"
                sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                onClick={() => setIsAddModalOpen(true)}
              >
                Добавить
              </Button>

              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                color="info"
                sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                disabled={selectedItems.length !== 1}
                onClick={() => {
                  const item = workingLineElements.find(el => el.id === selectedItems[0]);
                  if (item) {
                    setCurrentItem(item);
                    setFormData({
                      link: item.link,
                      size: item.size,
                      name: item.name,
                      title: item.title,
                      value: item.value
                    });
                    setIsEditModalOpen(true);
                  }
                }}
              >
                Редактировать
              </Button>

              <Button 
                variant="outlined" 
                startIcon={<DeleteIcon />}
                color="error"
                sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                disabled={selectedItems.length === 0}
                onClick={handleDelete}
              >
                Удалить ({selectedItems.length})
              </Button>
            </Box>
          </Box>

          <div className='equipment-grid'>
            {workingLineElements.map((item) => (
              <WorkingLineElement
                key={item.id}
                {...item}
                selected={selectedItems.includes(item.id)}
                onSelect={() => handleSelectItem(item.id)}
              />
            ))}
          </div>
        </div>

        <div className='performance-section'>
          <h3 className='section-title'>Эффективность работы</h3>
          <div className='performance-metrics'>
            <div className={`metric-card ${metrics.hasCriticalErrors ? 'critical-error' : ''}`}>
              <span className='metric-label'>Общая эффективность</span>
              <span className='metric-value'>
                {metrics.efficiencyPercentage}%
                {metrics.hasCriticalErrors && (
                  <div className='error-alert blinking-text'>
                    СРОЧНО ИСПРАВЬТЕ: {metrics.errorMachineIds.join(', ')}
                  </div>
                )}
              </span>
            </div>
            <div className={`metric-card ${metrics.attentionNeeded > 0 ? 'warning' : ''}`}>
              <span className='metric-label'>Требует внимания</span>
              <span className='metric-value'>
                {metrics.attentionNeeded} {getMachineWord(metrics.attentionNeeded)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно добавления */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <DialogTitle>Добавить оборудование</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Название"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Заголовок"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Значение"
            type="number"
            fullWidth
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
          />
          <TextField
            margin="dense"
            label="Размер"
            select
            fullWidth
            value={formData.size}
            onChange={(e) => setFormData({...formData, size: e.target.value})}
          >
            <option value="element-card">Обычный</option>
            <option value="element-card-wide">Широкий</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddModalOpen(false)}>Отмена</Button>
          <Button onClick={handleAdd} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно редактирования */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <DialogTitle>Редактировать оборудование</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Название"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Заголовок"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Значение"
            type="number"
            fullWidth
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
          />
          <TextField
            margin="dense"
            label="Размер"
            select
            fullWidth
            value={formData.size}
            onChange={(e) => setFormData({...formData, size: e.target.value})}
          >
            <option value="element-card">Обычный</option>
            <option value="element-card-wide">Широкий</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>Отмена</Button>
          <Button onClick={handleEdit} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function getMachineWord(count: number): string {
  const cases = [2, 0, 1, 1, 1, 2];
  const words = ['машина', 'машины', 'машин'];
  return words[
    count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]
  ];
}