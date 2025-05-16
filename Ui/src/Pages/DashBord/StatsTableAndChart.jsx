import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';
import { motion } from 'framer-motion';
import { Zoom } from "@mui/material";
import { useState, useEffect } from 'react';

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


export default function StatsTableAndChart({ equipmentData, time }) {
  const [hourlyProductionData, setHourlyProductionData] = useState({
    hours: ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00'],
    units: Array(8).fill(0).map(() => randomInRange(800, 1500)),
    defects: Array(8).fill(0).map(() => randomInRange(5, 25))
  });

  // Обновление данных графика
  useEffect(() => {
    const interval = setInterval(() => {
      setHourlyProductionData(prev => ({
        ...prev,
        units: prev.units.map((val, i) => 
          i === prev.units.length - 1 
            ? randomInRange(800, 1500) 
            : prev.units[i + 1]
        ),
        defects: prev.defects.map((val, i) => 
          i === prev.defects.length - 1 
            ? randomInRange(5, 25) 
            : prev.defects[i + 1]
        )
      }));
    }, randomInRange(5000, 15000));

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Работает': return 'success';
      case 'На обслуживании': return 'warning';
      case 'Ожидание': return 'info';
      case 'Авария': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
      {/* Таблица статистики */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ width: '100%' }}
      >
        <TableContainer sx={{ 
          width: '100%',
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }} component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="статистика оборудования">
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Параметр</TableCell>
                {equipmentData.map((equip) => (
                  <TableCell 
                    key={equip.id} 
                    align="right"
                    sx={{ color: 'common.white', fontWeight: 'bold' }}
                  >
                    {equip.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {['status', 'efficiency', 'temperature', 'output', 'errors'].map((param) => (
                <TableRow key={param}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {{
                      status: 'Статус',
                      efficiency: 'Эффективность',
                      temperature: 'Температура',
                      output: 'Выработка',
                      errors: 'Ошибки'
                    }[param]}
                  </TableCell>
                  {equipmentData.map((equip) => (
                    <TableCell 
                      key={`${param}-${equip.id}`} 
                      align="right"
                      sx={{ 
                        color: param === 'status' 
                          ? getStatusColor(equip.stats[param]) === 'success' 
                            ? 'success.main' 
                            : getStatusColor(equip.stats[param]) === 'error' 
                              ? 'error.main' 
                              : 'warning.main'
                          : param === 'errors' && parseInt(equip.stats[param]) > 5
                            ? 'error.main'
                            : 'inherit'
                      }}
                    >
                      {equip.stats[param]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
      
      {/* График производительности */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{ width: '100%' }}
      >
        <Box sx={{ 
          width: '100%',
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          height: '100%'
        }}>
          <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Производительность линии SMT-1
          </Typography>
          <Zoom in={true}>
            <div>
              <LineChart
                xAxis={[{ 
                  data: hourlyProductionData.hours,
                  scaleType: 'point',
                  label: 'Время смены'
                }]}
                yAxis={[{
                  label: 'Количество деталей'
                }]}
                series={[
                  {
                    data: hourlyProductionData.units,
                    label: 'Выпущено деталей',
                    color: '#1976d2',
                    showMark: ({ index }) => index === hourlyProductionData.units.length - 1,
                    area: true
                  },
                  {
                    data: hourlyProductionData.defects,
                    label: 'Бракованные детали',
                    color: '#d32f2f',
                    showMark: ({ index }) => index === hourlyProductionData.defects.length - 1
                  }
                ]}
                height={400}
                margin={{ left: 70, right: 30, top: 30, bottom: 70 }}
                slotProps={{
                  legend: {
                    direction: 'row',
                    position: { vertical: 'top', horizontal: 'right' },
                    padding: 0,
                  },
                }}
              />
            </div>
          </Zoom>
          <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
            Последнее обновление: {time}
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}