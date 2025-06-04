import { dbPromise } from '../../Server/db/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для определения уровня логирования
function determineLogLevel(message) {
  if (message.includes("WARNING")) return "WARNING";
  if (message.includes("ERROR")) return "ERROR";
  if (message.includes("FREEZE")) return "FREEZE";
  return "INFO";
}

// Функция для парсинга строки лога ошибок
function parseErrorLogLine(line) {
  const regex = /(\d{2}\/\d{2}\/\d{2}) (\d{2}:\d{2}:\d{2}) (.*)/;
  const match = line.match(regex);
  if (!match) return null;

  const [, date, time, message] = match;
  const datetime = `${date} ${time}`;

  const feederMatch = message.match(/(?:^|\s)(F\d{1,3}|R\d{1,3})(?:\s|$)/);
  const feeder = feederMatch ? feederMatch[1].trim() : '';

  const headMatch = message.match(/(?:^|\s)(Head\d+)/);
  const head = headMatch ? headMatch[1].trim() : 'Unknown';

  let parsedMessage = {};
  if (message.includes("Failed to pick up a part properly")) {
    const partRegex = /Part (.*)/;
    const partMatch = message.match(partRegex);
    if (partMatch) {
      parsedMessage.type = "PartError";
      parsedMessage.part = partMatch[1];
    }
  } else if (message.includes("The retry count for part pickup was exceeded")) {
    const feederRegex = /Feeder (.*) Part (.*)/;
    const feederMatch = message.match(feederRegex);
    if (feederMatch) {
      parsedMessage.type = "FeederError";
      parsedMessage.feeder = feederMatch[1];
      parsedMessage.part = feederMatch[2];
    }
  } else if (message.includes("Clamp Unlocked")) {
    parsedMessage.type = "ClampEvent";
    parsedMessage.event = "Unlocked";
  } else if (message.includes("Clamp Locked")) {
    parsedMessage.type = "ClampEvent";
    parsedMessage.event = "Locked";
  }

  return {
    timestamp: datetime,
    level: determineLogLevel(message),
    message: message.trim(),
    feeder,
    head,
    ...parsedMessage
  };
}

// Функция для парсинга строки операционного лога
function parseOperateLogLine(line) {
  const regex = /(\d{2}\/\d{2}\/\d{2}) (\d{2}:\d{2}:\d{2}) (.*)/;
  const match = line.match(regex);
  if (!match) return null;

  const [, date, time, message] = match;
  const datetime = `${date}T${time}`;

  const feederRegex = /\s[RF]\d{1,3}\s/g;
  let feederMatch = feederRegex.exec(message);

  let parsedMessage = {};
  if (feederMatch) {
    parsedMessage.feeder = feederMatch[0].trim();
  }

  if (message.includes("Failed to pick up a part properly")) {
    const partRegex = /Part (.*)/;
    const partMatch = message.match(partRegex);
    if (partMatch) {
      parsedMessage.type = "PartError";
      parsedMessage.part = partMatch[1];
    }
  } else if (message.includes("The retry count for part pickup was exceeded")) {
    const feederRegex = /Feeder (.*) Part (.*)/;
    const feederMatch = message.match(feederRegex);
    if (feederMatch) {
      parsedMessage.type = "FeederError";
      parsedMessage.feeder = feederMatch[1];
      parsedMessage.part = feederMatch[2];
    }
  } else if (message.includes("Clamp Unlocked")) {
    parsedMessage.type = "ClampEvent";
    parsedMessage.event = "Unlocked";
  } else if (message.includes("Clamp Locked")) {
    parsedMessage.type = "ClampEvent";
    parsedMessage.event = "Locked";
  }

  return {
    datetime,
    message: message.trim(),
    ...parsedMessage
  };
}

// Функция для сохранения данных в файл JSON в папке public
async function saveDataToPublic(equipmentId, data, type) {
  const publicDir = path.join(__dirname, '..', 'public');
  const equipmentDir = path.join(publicDir, equipmentId);
  
  try {
    // Создаем директорию для оборудования, если ее нет
    await fs.mkdir(equipmentDir, { recursive: true });
    
    // Сохраняем данные в файл
    const fileName = `${type}.json`;
    const filePath = path.join(equipmentDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    console.log(`Successfully saved ${type} data for ${equipmentId} to ${filePath}`);
  } catch (error) {
    console.error(`Error saving ${type} data to public folder:`, error);
    throw error;
  }
}

// Функция обработки логов
async function processLogFile(inputPath, equipmentId, parseFunction, logType) {
  console.log(`Processing ${logType} log for ${equipmentId}: ${inputPath}`);
  
  try {
    await fs.access(inputPath);
    const data = await fs.readFile(inputPath, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    console.log(`Found ${lines.length} lines in ${logType} log`);
    
    const jsonObjects = lines.map(parseFunction).filter(obj => obj !== null);
    await saveDataToPublic(equipmentId, jsonObjects, logType);
    
    console.log(`Successfully processed ${logType} data for ${equipmentId}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`${logType} log file not found: ${inputPath}`);
      return;
    }
    console.error(`Error processing ${logType} log file ${inputPath}:`, err);
    throw err;
  }
}

// Основная функция
async function processEquipmentLogs() {
  const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', 'Server', 'logs');
  
  console.log(`Starting log processing from: ${LOG_DIR}`);

  try {
    const db = await dbPromise;
    const equipmentList = await db.all('SELECT id, name FROM Equipment');
    
    console.log(`Found ${equipmentList.length} equipment items to process`);
    
    for (const equipment of equipmentList) {
      console.log(`Processing logs for ${equipment.id} (${equipment.name})...`);
      
      // Обработка Error.log
      const errorLogPath = path.join(LOG_DIR, `${equipment.name}_Error.log`);
      await processLogFile(errorLogPath, equipment.id, parseErrorLogLine, 'Error');
      
      // Обработка Operate.log
      const operateLogPath = path.join(LOG_DIR, `${equipment.name}_Operate.log`);
      await processLogFile(operateLogPath, equipment.id, parseOperateLogLine, 'Operate');
    }
    
    console.log('All equipment logs processed and saved to public folder');
  } catch (err) {
    console.error('Error processing equipment logs:', err);
    process.exit(1);
  }
}

// Запуск обработки
processEquipmentLogs();