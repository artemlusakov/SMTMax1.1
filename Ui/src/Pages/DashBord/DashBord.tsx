import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box
} from "@mui/material";

export default function DashBord() {
  const [time, setTime] = useState('00-00-0000 00:00:00');

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

  // Данные по оборудованию
  const equipmentData = [
    {
      id: 1,
      name: "Линия пайки SMT-1",
      image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
      stats: {
        status: "Работает",
        efficiency: "92%",
        temperature: "245°C",
        output: "1250 ед/час",
        errors: "2"
      }
    },
    {
      id: 2,
      name: "Линия пайки SMT-2",
      image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
      stats: {
        status: "На обслуживании",
        efficiency: "0%",
        temperature: "25°C",
        output: "0 ед/час",
        errors: "0"
      }
    },
    {
      id: 3,
      name: "Конвейерная линия",
      image: "https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg",
      stats: {
        status: "Работает",
        efficiency: "87%",
        temperature: "30°C",
        output: "980 ед/час",
        errors: "5"
      }
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Текущая смена: {time}
      </Typography>
      
      {/* Карточки оборудования */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {equipmentData.map((equip) => (
          <Grid item xs={12} md={4} key={equip.id}>
            <Card>
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
                <Typography color={equip.stats.status === "Работает" ? "success.main" : "error.main"}>
                  Статус: <strong>{equip.stats.status}</strong>
                </Typography>
                <Typography>Эффективность: {equip.stats.efficiency}</Typography>
                <Typography>Температура: {equip.stats.temperature}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Таблица статистики */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="статистика оборудования">
          <TableHead>
            <TableRow>
              <TableCell>Оборудование</TableCell>
              <TableCell align="right">Статус</TableCell>
              <TableCell align="right">Эффективность</TableCell>
              <TableCell align="right">Температура</TableCell>
              <TableCell align="right">Выработка</TableCell>
              <TableCell align="right">Ошибки</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipmentData.map((equip) => (
              <TableRow
                key={equip.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {equip.name}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ color: equip.stats.status === "Работает" ? "success.main" : "error.main" }}
                >
                  {equip.stats.status}
                </TableCell>
                <TableCell align="right">{equip.stats.efficiency}</TableCell>
                <TableCell align="right">{equip.stats.temperature}</TableCell>
                <TableCell align="right">{equip.stats.output}</TableCell>
                <TableCell align="right">{equip.stats.errors}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}