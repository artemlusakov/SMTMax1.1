import React, { useState, useEffect } from 'react';

function App() {
  const [config, setConfig] = useState({
    machineId: '',
    machineName: '',
    logPath: '',
    serverUrl: 'http://localhost:3000' // Ваш работающий URL
  });

  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    message: 'Проверка подключения...',
    lastChecked: null,
    serverTime: null
  });

  // Функция проверки подключения
  const checkServerConnection = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch(`${config.serverUrl}/api/status`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const pingTime = Date.now() - startTime;

      setConnectionStatus({
        isConnected: true,
        message: `Подключено (пинг: ${pingTime}мс)`,
        lastChecked: new Date().toLocaleTimeString(),
        serverTime: new Date(data.timestamp).toLocaleTimeString()
      });

      return true;
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        message: `Ошибка: ${error.message}`,
        lastChecked: new Date().toLocaleTimeString(),
        serverTime: null
      });
      
      console.error('Детали ошибки:', {
        error: error.toString(),
        config: config,
        stack: error.stack
      });
      
      return false;
    }
  };

  // Проверяем соединение при загрузке и при изменении URL сервера
  useEffect(() => {
    const initialCheck = async () => {
      await checkServerConnection();
    };
    initialCheck();

    // Периодическая проверка (каждые 30 секунд)
    const intervalId = setInterval(checkServerConnection, 30000);
    return () => clearInterval(intervalId);
  }, [config.serverUrl]);

  // Стили для статуса подключения
  const statusStyles = {
    padding: '15px',
    margin: '20px 0',
    borderRadius: '5px',
    backgroundColor: connectionStatus.isConnected ? '#d4edda' : '#f8d7da',
    color: connectionStatus.isConnected ? '#155724' : '#721c24',
    border: `1px solid ${connectionStatus.isConnected ? '#c3e6cb' : '#f5c6cb'}`
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Настройка конфигурации оборудования</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>URL сервера:</label>
        <input
          type="text"
          value={config.serverUrl}
          onChange={(e) => setConfig({...config, serverUrl: e.target.value})}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button 
          onClick={checkServerConnection}
          style={{
            marginTop: '10px',
            padding: '8px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Проверить подключение
        </button>
      </div>

      {/* Блок статуса подключения */}
      <div style={statusStyles}>
        <h3>Статус подключения к серверу</h3>
        <p><strong>Состояние:</strong> {connectionStatus.message}</p>
        {connectionStatus.isConnected && (
          <>
            <p><strong>Время сервера:</strong> {connectionStatus.serverTime}</p>
            <p><strong>Последняя проверка:</strong> {connectionStatus.lastChecked}</p>
          </>
        )}
      </div>

      {/* Форма конфигурации */}
      <div style={{ 
        border: '1px solid #ddd',
        padding: '20px',
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h2>Конфигурация оборудования</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>ID оборудования:</label>
          <input
            type="text"
            placeholder="Например: machine-01"
            value={config.machineId}
            onChange={(e) => setConfig({...config, machineId: e.target.value})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Название оборудования:</label>
          <input
            type="text"
            placeholder="Например: Станок ЧПУ #1"
            value={config.machineName}
            onChange={(e) => setConfig({...config, machineName: e.target.value})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Путь к лог-файлам:</label>
          <input
            type="text"
            placeholder="Например: C:\logs\machine.log"
            value={config.logPath}
            onChange={(e) => setConfig({...config, logPath: e.target.value})}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <button
          disabled={!connectionStatus.isConnected}
          style={{
            padding: '10px 15px',
            backgroundColor: connectionStatus.isConnected ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: connectionStatus.isConnected ? 'pointer' : 'not-allowed'
          }}
        >
          {connectionStatus.isConnected ? 'Сохранить конфигурацию' : 'Сервер недоступен'}
        </button>
      </div>
    </div>
  );
}

export default App;