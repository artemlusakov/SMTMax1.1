import { useEffect, useState } from "react";
import { Box, Typography, Switch, FormControlLabel, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { motion } from 'framer-motion';
import EquipmentCards from "./EquipmentCards";
import StatsTableAndChart from "./StatsTableAndChart";
import Clock from "../../Components/Clock/Clock";


export default function Dashboard() {
  const [equipmentData, setEquipmentData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCard, setNewCard] = useState({
    id: '',
    name: '',
    image: ''
  });

  const handleAddCard = () => {
    const updatedData = [
      ...equipmentData,
      {
        ...newCard,
        stats: generateEquipmentStats()
      }
    ];
    setEquipmentData(updatedData);
    setNewCard({ id: '', name: '', image: '' });
    setOpenDialog(false);
  };

  const handleDeleteCard = (id) => {
    const updatedData = equipmentData.filter(card => card.id !== id);
    setEquipmentData(updatedData);
  };

  const generateEquipmentStats = () => {
    const isWorking = Math.random() > 0.1;
    const status = isWorking ? "Работает" : ['На обслуживании', 'Ожидание', 'Авария'][Math.floor(Math.random() * 3)];
    
    return {
      status,
      efficiency: isWorking ? Math.floor(Math.random() * 16) + 80 + "%" : Math.floor(Math.random() * 31) + "%",
      temperature: isWorking ? Math.floor(Math.random() * 11) + 240 + "°C" : Math.floor(Math.random() * 21) + 20 + "°C",
      output: isWorking ? Math.floor(Math.random() * 301) + 1000 + " ед/час" : Math.floor(Math.random() * 301) + " ед/час",
      errors: isWorking ? Math.floor(Math.random() * 6).toString() : Math.floor(Math.random() * 11).toString()
    };
  };

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
        setEquipmentData={setEquipmentData} 
        equipmentData={equipmentData}
        isAdmin={isAdmin}
        onDelete={handleDeleteCard}
      />
      
      <StatsTableAndChart equipmentData={equipmentData} />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Добавить новое оборудование</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ID оборудования"
            fullWidth
            value={newCard.id}
            onChange={(e) => setNewCard({...newCard, id: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Название оборудования"
            fullWidth
            value={newCard.name}
            onChange={(e) => setNewCard({...newCard, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="URL изображения"
            fullWidth
            value={newCard.image}
            onChange={(e) => setNewCard({...newCard, image: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleAddCard} color="primary">Добавить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}