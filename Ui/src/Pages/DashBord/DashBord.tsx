import { useEffect, useState } from "react";
import { 
  Box, Typography, Switch, FormControlLabel, Button, 
  Dialog, DialogTitle, DialogContent, TextField, 
  DialogActions, CircularProgress, Alert, Snackbar
} from "@mui/material";
import { motion } from 'framer-motion';
import EquipmentCards from "./EquipmentCards";
import StatsTableAndChart from "./StatsTableAndChart";
import Clock from "../../Components/Clock/Clock";

interface Equipment {
  id: string;
  name: string;
  image: string;
  isWorking: string;
  status: string;
  efficiency: string;
  temperature: string;
  output: string;
  errors: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NewEquipment {
  id: string;
  name: string;
  image: string;
  isWorking: string;
  status: string;
  efficiency: string;
  temperature: string;
  output: string;
  errors: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export default function Dashboard() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [newCard, setNewCard] = useState<NewEquipment>({
    id: '',
    name: '',
    image: '',
    isWorking: '1',
    status: '1',
    efficiency: '90',
    temperature: '245',
    output: '1000',
    errors: '0'
  });

  // Загрузка данных с сервера
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/dashboard');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const data: Equipment[] = await response.json();
        setEquipmentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        showSnackbar(err instanceof Error ? err.message : 'Неизвестная ошибка', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddCard = async () => {
    try {
      const cardData: Equipment = {
        ...newCard,
        temperature: `${newCard.temperature}°C`,
        output: `${newCard.output} ед/час`
      };

      const response = await fetch('http://localhost:8080/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });

      if (!response.ok) throw new Error('Ошибка добавления оборудования');

      const addedCard: Equipment = await response.json();
      setEquipmentData(prev => [...prev, addedCard]);
      setNewCard({
        id: '',
        name: '',
        image: '',
        isWorking: '1',
        status: '1',
        efficiency: '90',
        temperature: '245',
        output: '1000',
        errors: '0'
      });
      setOpenDialog(false);
      showSnackbar('Оборудование успешно добавлено');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Неизвестная ошибка', 'error');
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Ошибка удаления оборудования');

      setEquipmentData(prev => prev.filter(card => card.id !== id));
      showSnackbar('Оборудование успешно удалено');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Неизвестная ошибка', 'error');
    }
  };

  const handleEditCard = async (updatedCard: Equipment) => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/${updatedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard)
      });

      if (!response.ok) throw new Error('Ошибка обновления оборудования');

      const updatedData: Equipment = await response.json();
      setEquipmentData(prev => 
        prev.map(card => card.id === updatedCard.id ? updatedData : card)
      );
      showSnackbar('Оборудование успешно обновлено');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Неизвестная ошибка', 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCard(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            sx={{
              fontWeight: 'bold',
              color: 'primary.main'
            }} 
            variant="h4" 
            gutterBottom
          >
            <Clock prefix="Текущая смена:" />
          </Typography>

          <FormControlLabel
            control={
              <Switch 
                checked={isAdmin} 
                onChange={(e) => setIsAdmin(e.target.checked)} 
                color="primary"
              />
            }
            label="Режим администратора"
          />
        </Box>
      </motion.div>

      {isAdmin && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setOpenDialog(true)}
          >
            Добавить оборудование
          </Button>
        </Box>
      )}

      <EquipmentCards 
        equipmentData={equipmentData}
        isAdmin={isAdmin}
        onDelete={handleDeleteCard}
        onEdit={handleEditCard}
      />
      
      <StatsTableAndChart equipmentData={equipmentData} />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить новое оборудование</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="ID оборудования"
            name="id"
            fullWidth
            required
            value={newCard.id}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Название оборудования"
            name="name"
            fullWidth
            required
            value={newCard.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="URL изображения"
            name="image"
            fullWidth
            required
            value={newCard.image}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Эффективность (%)"
            name="efficiency"
            type="number"
            fullWidth
            value={newCard.efficiency}
            onChange={handleInputChange}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Температура (°C)"
            name="temperature"
            type="number"
            fullWidth
            value={newCard.temperature}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Выработка (ед/час)"
            name="output"
            type="number"
            fullWidth
            value={newCard.output}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Ошибки"
            name="errors"
            type="number"
            fullWidth
            value={newCard.errors}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleAddCard} 
            color="primary"
            disabled={!newCard.id || !newCard.name || !newCard.image}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}