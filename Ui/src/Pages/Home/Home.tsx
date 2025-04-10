import './Home.css';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  Switch, FormControlLabel 
} from '@mui/material';
import Navigate from '../../Components/Navigate/Navigate';
import HomeButtons from './HomeButton/HomeButton';
import WorkingLineElement from './LineElement/WorkingLineElement';
import AddElementWindow from './HomeWindows/AddElementWindow';

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
  // Состояния данных
  const [workingLineElements, setWorkingLineElements] = useState<DataObject[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Состояния модальных окон
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Состояния форм
  const [currentItem, setCurrentItem] = useState<DataObject | null>(null);
  const [formData, setFormData] = useState<Omit<DataObject, 'id'>>({
    link: '/Statistics',
    size: 'element-card',
    name: '',
    title: '',
    value: 0
  });
  
  // Режим редактирования
  const [editMode, setEditMode] = useState(false);

  // Загрузка данных
  const loadData = useCallback(async () => {
    const data = await fetchEquipmentData();
    setWorkingLineElements(data);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Обработчики действий
  const refreshData = useCallback(async () => {
    await loadData();
    setSelectedItems([]);
  }, [loadData]);

  const handleSelectItem = useCallback((id: string) => {
    if (!editMode) {
      // Обычный режим - переход по ссылке
      window.location.href = `/Statistics/${id}`;
      return;
    }
    // Режим редактирования - выбор элемента
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  }, [editMode]);

  const handleAdd = useCallback(async () => {
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
  }, [formData, refreshData]);

  const handleEdit = useCallback(async () => {
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
  }, [currentItem, formData, refreshData]);

  const handleDelete = useCallback(async () => {
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
  }, [selectedItems, refreshData]);

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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editMode}
                    onChange={() => {
                      setEditMode(!editMode);
                      setSelectedItems([]);
                    }}
                    color="primary"
                  />
                }
                label="Режим редактирования"
                labelPlacement="start"
              />

              <HomeButtons
                selectedCount={selectedItems.length}
                hasSingleSelection={selectedItems.length === 1}
                onRefresh={refreshData}
                onAdd={() => setIsAddModalOpen(true)}
                onEdit={() => {
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
                onDelete={handleDelete}
                editMode={editMode}
              />
            </Box>
          </Box>

          <div className='equipment-grid'>
            {workingLineElements.map((item) => (
              <WorkingLineElement
                key={item.id}
                {...item}
                selected={selectedItems.includes(item.id)}
                onSelect={() => handleSelectItem(item.id)}
                editMode={editMode}
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
      <AddElementWindow
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          formData={formData}
          onFormChange={(field, value) => setFormData(prev => ({...prev, [field]: value}))}
          onSave={handleAdd}
        />
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
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Заголовок"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Значение"
            type="number"
            fullWidth
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Размер"
            select
            fullWidth
            value={formData.size}
            onChange={(e) => setFormData({...formData, size: e.target.value})}
            SelectProps={{ native: true }}
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