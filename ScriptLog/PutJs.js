const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Конфигурация
const SERVER_URL = 'http://localhost:8080/api/equipment';
const PUBLIC_DIR = path.join(__dirname, '../UI/public');
const EQUIPMENT_IDS = ['e133415', 'e133416', 'e133417'];
const FILES_TO_SEND = {
  'Error.json': '/Error.json',
  'Operate.json': '/Operate.json'
};

async function sendJsonFiles() {
  try {
    for (const equipmentId of EQUIPMENT_IDS) {
      const equipmentDir = path.join(PUBLIC_DIR, equipmentId);
      
      if (!fs.existsSync(equipmentDir)) {
        console.warn(`Директория ${equipmentId} не найдена`);
        continue;
      }

      for (const [filename, endpoint] of Object.entries(FILES_TO_SEND)) {
        const filePath = path.join(equipmentDir, filename);
        
        if (!fs.existsSync(filePath)) {
          console.warn(`Файл ${filename} не найден в ${equipmentId}`);
          continue;
        }

        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(fileContent);

          const response = await axios.post(
            `${SERVER_URL}/${equipmentId}${endpoint}`,
            jsonData,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          console.log(`Данные ${equipmentId}${endpoint} отправлены:`, response.status);
        } catch (error) {
          console.error(`Ошибка при отправке ${equipmentId}${endpoint}:`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
        }
      }
    }
  } catch (error) {
    console.error('Критическая ошибка:', error.message);
  }
}

sendJsonFiles();