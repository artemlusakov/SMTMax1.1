import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardMedia, Typography, LinearProgress, Chip, Tooltip, Button } from "@mui/material";
import { motion } from 'framer-motion';

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomStatus = () => ['Работает', 'На обслуживании', 'Ожидание', 'Авария'][randomInRange(0, 3)];

const getStatusColor = (status) => {
  switch(status) {
    case 'Работает': return 'success';
    case 'На обслуживании': return 'warning';
    case 'Ожидание': return 'info';
    case 'Авария': return 'error';
    default: return 'default';
  }
};

export default function EquipmentCards({ time, setEquipmentData }) {
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Хук для навигации

  // Инициализация данных оборудования
  useEffect(() => {
    const initialData = [
      {
        id: 'e133415', // Изменил ID на строковый формат
        name: "Линия пайки SMT-1",
        image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
      },
      {
        id: 'e133416',
        name: "Линия пайки SMT-2",
        image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
      },
      {
        id: 'e133417',
        name: "Линия пайки SMT-3",
        image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
      },
      {
        id: 'e133418',
        name: "Линия пайки SMT-4",
        image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
      },
      {
        id: 'e133419',
        name: "Конвейерная линия",
        image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
      }
    ].map(equip => ({
      ...equip,
      stats: generateEquipmentStats()
    }));
    
    setData(initialData);
    setEquipmentData(initialData);
  }, [setEquipmentData]);

  function generateEquipmentStats() {
    const isWorking = Math.random() > 0.1;
    const status = isWorking ? "Работает" : randomStatus();
    
    return {
      status,
      efficiency: isWorking ? randomInRange(80, 95) + "%" : randomInRange(0, 30) + "%",
      temperature: isWorking ? randomInRange(240, 250) + "°C" : randomInRange(20, 40) + "°C",
      output: isWorking ? randomInRange(1000, 1300) + " ед/час" : randomInRange(0, 300) + " ед/час",
      errors: isWorking ? randomInRange(0, 5).toString() : randomInRange(0, 10).toString()
    };
  }

  // Обновление данных оборудования
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = data.map(equip => ({
        ...equip,
        stats: generateEquipmentStats()
      }));
      
      setData(updatedData);
      setEquipmentData(updatedData);
    }, randomInRange(5000, 15000));

    return () => clearInterval(interval);
  }, [data, setEquipmentData]);

  // Функция для перехода к статистике оборудования
  const handleViewStatistics = (id) => {
    navigate(`/Statistics/${id}`);
  };

  return (
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
            overflow: 'hidden'
          }}>
            <CardMedia
              component="img"
              height="180"
              image={equip.image}
              alt={equip.name}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {equip.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ mr: 1 }}>Статус:</Typography>
                <Chip 
                  label={equip.stats.status} 
                  color={getStatusColor(equip.stats.status)} 
                  size="small"
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
                        backgroundColor: equip.stats.status === "Работает" ? 'success.main' : 'warning.main'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {equip.stats.efficiency}
                  </Typography>
                </Box>
              </Tooltip>
              
              <Typography>Температура: {equip.stats.temperature}</Typography>
              <Typography>Выработка: {equip.stats.output}</Typography>
              <Typography color={parseInt(equip.stats.errors) > 5 ? 'error.main' : 'text.secondary'}>
                Ошибки: {equip.stats.errors}
              </Typography>
              
              {/* Кнопка для перехода к статистике */}
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => handleViewStatistics(equip.id)}
              >
                Подробная статистика
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
}