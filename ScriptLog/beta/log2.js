import { dbPromise } from '../../Server/db/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем текущий путь к файлу
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

  // Извлекаем Feeder из сообщения
  const feederMatch = message.match(/(?:^|\s)(F\d{1,3}|R\d{1,3})(?:\s|$)/);
  const feeder = feederMatch ? feederMatch[1].trim() : '';

  // Извлекаем Head из сообщения
  const headMatch = message.match(/(?:^|\s)(Head\d+)/);
  const head = headMatch ? headMatch[1].trim() : 'Unknown';

  // Парсинг специфичных сообщений
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

  // Регулярное выражение для поиска фидера
  const feederRegex = /\s[RF]\d{1,3}\s/g;

  let parsedMessage = {};
  let feederMatch = feederRegex.exec(message);

  // Извлечение информации о фидере
  if (feederMatch) {
    parsedMessage.feeder = feederMatch[0].trim();
  }

  // Парсинг содержимого сообщения
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

// Функция обработки одного лог-файла
async function processLogFile(inputPath, outputPath, parseFunction, logType) {
  console.log(`Processing ${logType} log: ${inputPath}`);
  
  try {
    // Проверяем существование исходного файла
    try {
      await fs.access(inputPath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error(`${logType} log file not found: ${inputPath}`);
        return;
      }
      throw err;
    }

    // Читаем и обрабатываем файл
    const data = await fs.readFile(inputPath, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    console.log(`Found ${lines.length} lines in ${logType} log`);
    
    const jsonObjects = lines.map(parseFunction).filter(obj => obj !== null);
    
    // Записываем результат в JSON
    await fs.writeFile(outputPath, JSON.stringify(jsonObjects, null, 2));
    console.log(`Successfully created ${outputPath} with ${jsonObjects.length} entries`);
    
  } catch (err) {
    console.error(`Error processing ${logType} log file ${inputPath}:`, err);
    throw err;
  }
}

// Основная функция обработки логов оборудования
async function processEquipmentLogs() {
  // Пути относительно расположения logServer.js
  const LOG_DIR = path.join(__dirname, '..', 'Server', 'logs');
  const DATA_DIR = path.join(__dirname, '..', 'UI', 'public');
  
  console.log(`Starting log processing...`);
  console.log(`LOG_DIR: ${LOG_DIR}`);
  console.log(`DATA_DIR: ${DATA_DIR}`);

  try {
    const db = await dbPromise;
    const equipmentList = await db.all('SELECT id, name FROM Equipment');
    
    console.log(`Found ${equipmentList.length} equipment items to process`);
    
    for (const equipment of equipmentList) {
      console.log(`Processing logs for equipment ${equipment.id} (${equipment.name})...`);
      
      const equipmentDir = path.join(DATA_DIR, equipment.id);
      
      // Создаем директорию для оборудования
      try {
        await fs.mkdir(equipmentDir, { recursive: true });
        console.log(`Created directory: ${equipmentDir}`);
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
        console.log(`Directory already exists: ${equipmentDir}`);
      }
      
      // Обрабатываем Error.log
      const errorLogPath = path.join(LOG_DIR, `${equipment.name}_Error.log`);
      await processLogFile(
        errorLogPath, 
        path.join(equipmentDir, 'Error.json'), 
        parseErrorLogLine,
        'Error'
      );
      
      // Обрабатываем Operate.log
      const operateLogPath = path.join(LOG_DIR, `${equipment.name}_Operate.log`);
      await processLogFile(
        operateLogPath, 
        path.join(equipmentDir, 'Operate.json'), 
        parseOperateLogLine,
        'Operate'
      );
    }
    
    console.log('All equipment logs processed successfully');
  } catch (err) {
    console.error('Error processing equipment logs:', err);
    process.exit(1);
  }
}

// Запускаем обработку логов
processEquipmentLogs();


// env

// # Где логи
// LOG_DIR=C:\Users\z\Desktop\Log

// #Куда отдать json
// OUTPUT_DIR=D:\SMTMax1.1\ScriptLog