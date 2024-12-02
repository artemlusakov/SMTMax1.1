require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Функция для нормализации пути
function normalizePath(p) {
    return path.normalize(p).replace(/\\/g, '/');
}

// Получаем пути из переменных окружения или используем значения по умолчанию
const LOG_DIR = normalizePath(process.env.LOG_DIR || 'C:\\Users\\z\\Desktop\\Log');
const OUTPUT_DIR = normalizePath(process.env.OUTPUT_DIR || 'D:\\SMTMax1.1\\ScriptLog');

console.log(`LOG_DIR: ${LOG_DIR}`);
console.log(`OUTPUT_DIR: ${OUTPUT_DIR}`);

// Функция для проверки и удаления существующего JSON-файла
function checkAndRemoveExistingFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Файл ${filePath} успешно удален.`);
    } else {
        console.log(`Файл ${filePath} не найден.`);
    }
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

    // Остальная часть парсинга остается без изменений
    let parsedMessage;
    if (message.includes("Failed to pick up a part properly")) {
        const partRegex = /Part (.*)/;
        const partMatch = message.match(partRegex);
        if (partMatch) {
            parsedMessage = {
                type: "PartError",
                part: partMatch[1]
            };
        }
    } else if (message.includes("The retry count for part pickup was exceeded")) {
        const feederRegex = /Feeder (.*) Part (.*)/;
        const feederMatch = message.match(feederRegex);
        if (feederMatch) {
            parsedMessage = {
                type: "FeederError",
                feeder: feederMatch[1],
                part: feederMatch[2]
            };
        }
    } else if (message.includes("Clamp Unlocked")) {
        parsedMessage = {
            type: "ClampEvent",
            event: "Unlocked"
        };
    } else if (message.includes("Clamp Locked")) {
        parsedMessage = {
            type: "ClampEvent",
            event: "Locked"
        };
    }

    return {
        timestamp: datetime,
        level: determineLogLevel(message),
        message: message.trim(),
        feeder: feeder,
        head: head,
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

    // Регулярное выражение для поиска фидера (R или F, за которыми следуют до трех цифр)
    const feederRegex = /\s[RF]\d{1,3}\s/g;

    let parsedMessage = {};
    let feederMatch = feederRegex.exec(message);

    // Извлечение информации о фидере
    if (feederMatch) {
        parsedMessage.feeder = feederMatch[0];
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
        message,
        ...parsedMessage
    };
}

// Функция для определения уровня логирования
function determineLogLevel(message) {
    if (message.includes("WARNING")) return "WARNING";
    if (message.includes("ERROR")) return "ERROR";
    if (message.includes("FREEZE")) return "FREEZE";
    return "INFO"; // По умолчанию
}

// Функция для чтения и преобразования лог-файла в JSON
function convertLogToJson(inputLogFilePath, outputJsonPath, isOperateLog = false) {
    checkAndRemoveExistingFile(outputJsonPath);

    if (!fs.existsSync(inputLogFilePath)) {
        console.error(`Файл ${inputLogFilePath} не найден!`);
        return;
    }

    fs.readFile(inputLogFilePath, 'utf8', (err, data) => {
        if (err) throw err;

        const lines = data.split('\n').filter(line => line.trim() !== '');
        const parseFunction = isOperateLog ? parseOperateLogLine : parseErrorLogLine;
        const jsonObjects = lines.map(parseFunction).filter(obj => obj !== null);

        fs.writeFile(outputJsonPath, JSON.stringify(jsonObjects, null, 2), 'utf8', err => {
            if (err) throw err;
            console.log(`Файл ${outputJsonPath} успешно создан.`);
        });
    });
}

const inputLogFilePaths = [
    path.join(LOG_DIR, 'Error.log'),
    path.join(LOG_DIR, 'Operate.log')
];

const outputJsonPaths = [
    path.join(OUTPUT_DIR, 'Error.json'),
    path.join(OUTPUT_DIR, 'Operate.json')
];

// Преобразуем лог-файлы в JSON
inputLogFilePaths.forEach((inputPath, index) => {
    const isOperateLog = index === 1; // Второй файл является операционным логом
    convertLogToJson(inputPath, outputJsonPaths[index], isOperateLog);
});