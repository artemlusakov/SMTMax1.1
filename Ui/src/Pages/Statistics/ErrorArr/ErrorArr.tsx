import React, { useState, useEffect } from 'react';
import { getErrorDescription } from '../../../Store/Warning/WarningDescription';
import './ErrorArr.css'

// Определяем интерфейс для элемента данных
interface DataItem {
    timestamp: string;
    level: string;
    message: string;
    feeder?: string;
    head?: string;
    type?: string;
    event?: string;
    part?: string;
}

interface Props {
    url: string
}
// Функция для извлечения кода ошибки из сообщения
const getErrorCodeFromMessage = (message: string): string | null => {
    const match = message.match(/\[[a-zA-Z0-9]+\]/);
    if (match) {
        return match[0].slice(1, -1); // Возвращаем только цифры и буквы из скобок
    }
    return null;
};

const ErrorArr = (props:Props) => {
    const [errorCodes, setErrorCodes] = useState<Record<string, { count: number; description: string }>>({});
    const [inputCode, setInputCode] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        
        if (filteredValue !== value) {
          event.preventDefault();
        }
        
        setInputCode(filteredValue);
      };

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch(props.url)
          .then(response => response.json())
          .then((data: DataItem[]) => {
            if (Array.isArray(data)) {
              const filteredErrors = data.filter(item => item.level === 'WARNING');
      
              const codes = filteredErrors.reduce((acc: Record<string, { count: number; description: string }>, item) => {
                const errorCode = getErrorCodeFromMessage(item.message);
                if (errorCode) {
                  acc[errorCode] = {
                    count: (acc[errorCode]?.count || 0) + 1,
                    description: getErrorDescription(errorCode)
                  };
                }
                return acc;
              }, {});

              // Сортируем объект по значению count в порядке убывания
              const sortedCodes = Object.fromEntries(
                Object.entries(codes).sort((a, b) => b[1].count - a[1].count)
              );

              setErrorCodes(sortedCodes);
            } else {
              console.error('Неверные данные: data не массив');
            }
            setIsLoading(false);
          });
      }, []);
      
      if(isLoading){
        return <div>Загрузка...</div>;
      }
    return (
        <div className={"ErrorArr"}>        
            <div>
                <input 
                    type="text" 
                    placeholder="Введите код ошибки" 
                    value={inputCode} 
                    onChange={handleInputChange}
                />
                
                <p>Описание: {getErrorDescription(inputCode)}</p>
            </div>


            <ul>
            {Object.entries(errorCodes).map(([code, { count, description }]) => (
                <li key={code}>
                [{code}] - {description} <div className='Color_red'>Количество: ({count})</div>
                </li>
            ))}
            </ul>
        </div>
    );
};

export default ErrorArr;
