require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Функция для нормализации пути
function normalizePath(p) {
    return path.normalize(p).replace(/\\/g, '/');
}

// Получаем пути из переменных окружения или используем значения по умолчанию
const LOG_DIR = normalizePath('E:\\SMTMax1.1\\ScriptLog');
const OUTPUT_DIR = normalizePath('E:\\SMTMax1.1\\ScriptLog');

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

// Функция для парсинга строки лога
function parseLogLine(line) {
    const regex = /(\d{2}\/\d{2}\/\d{2}) (\d{2}:\d{2}:\d{2}) (.*)/;
    const match = line.match(regex);
    if (!match) return null;

    const [, date, time, message] = match;
    const datetime = `${date}T${time}`;

    // Извлекаем Feeder из сообщения
    let feeder = 'none';
    const feederMatch = message.match(/Feeder\s+([A-Z]\d{1,3}|R\d{1,3})\b/);
    if (feederMatch) {
        feeder = feederMatch[1].trim();
    }

    // Извлекаем Head из сообщения
    const headMatch = message.match(/(?:^|\s)(Head\d+)/);
    const head = headMatch ? headMatch[1].trim() : 'none';

    // Извлекаем FeederID из сообщения
    let feederID = 'none';
    const feederIDMatch = message.match(/FeederID\((\d+)\)/);
    if (feederIDMatch) {
        feederID = feederIDMatch[1].trim();
    }

    // Извлекаем Part из сообщения
    let part = 'none';
    const partMatch = message.match(/Part\s+([\w\._]+)/) || message.match(/Part\((.*?)\)/);
    if (partMatch) {
        part = partMatch[1].trim();
    }

    // Определяем тип сообщения
    const type = determineLogLevel(message);

    return {
        datetime,
        message: message.trim(),
        type,
        feeder,
        head,
        feederID,
        part
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
function convertLogToJson(inputLogFilePath, outputJsonPath) {
    checkAndRemoveExistingFile(outputJsonPath);

    if (!fs.existsSync(inputLogFilePath)) {
        console.error(`Файл ${inputLogFilePath} не найден!`);
        return;
    }

    fs.readFile(inputLogFilePath, 'utf8', (err, data) => {
        if (err) throw err;

        const lines = data.split('\n').filter(line => line.trim() !== '');
        const jsonObjects = lines.map(parseLogLine).filter(obj => obj !== null);

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
    convertLogToJson(inputPath, outputJsonPaths[index]);
});