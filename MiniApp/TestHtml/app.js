const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const LOGS_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

app.post('/upload', (req, res) => {
    try {
        const { machineId, filename, content, isBinary } = req.body;

        if (!machineId || !filename || content === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const machineDir = path.join(LOGS_DIR, machineId);
        if (!fs.existsSync(machineDir)) {
            fs.mkdirSync(machineDir, { recursive: true });
        }

        const filePath = path.join(machineDir, filename);
        
        if (isBinary) {
            // Для бинарных файлов
            const buffer = Buffer.from(content, 'base64');
            fs.writeFileSync(filePath, buffer);
        } else {
            // Для текстовых файлов
            fs.writeFileSync(filePath, content, 'utf8');
        }

        console.log(`File saved: ${filePath}`);
        res.json({ status: 'OK', path: `/${machineId}/${filename}` });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});