import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from 'framer-motion';
import EquipmentCards from "./EquipmentCards";
import StatsTableAndChart from "./StatsTableAndChart";

export default function Dashboard() {
  const [time, setTime] = useState('00-00-0000 00:00:00');
  const [equipmentData, setEquipmentData] = useState([]);

  // Обновление времени
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2,'0');
      const month = String(now.getMonth() + 1).padStart(2,'0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      setTime(`${day}-${month}-${year} ${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          sx={{
            display: "flex", 
            alignItems: 'center', 
            justifyContent:'center',
            mb: 3,
            fontWeight: 'bold',
            color: 'primary.main'
          }} 
          variant="h4" 
          gutterBottom
        >
          Текущая смена: {time}
        </Typography>
      </motion.div>
      
      <EquipmentCards time={time} setEquipmentData={setEquipmentData} />
      <StatsTableAndChart equipmentData={equipmentData} time={time} />
    </Box>
  );
}