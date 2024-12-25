import React, { useState, useEffect } from 'react';
import { getErrorDescription } from '../../../Store/Warning/WarningDescription';
import './ErrorArr.css'

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
    url: string;
}

const getErrorCodeFromMessage = (message: string): string | null => {
    const match = message.match(/\[[a-zA-Z0-9]+\]/);
    return match ? match[0].slice(1, -1) : null;
};

const ErrorArr = ({ url }: Props) => {
    const [errorCodes, setErrorCodes] = useState<Record<string, { count: number; description: string }>>({});
    const [inputCode, setInputCode] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isLoading, setIsLoading] = useState(true);

    // Обработчик изменения ввода для фильтрации по коду ошибки
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        
        if (filteredValue !== value) {
            event.preventDefault();
        }
        
        setInputCode(filteredValue);
    };

    // Переключение сортировки
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    // Получаем отсортированные данные при изменении сортировки
    useEffect(() => {
        const newSortedErrorCodes = Object.fromEntries(
            Object.entries(errorCodes).sort((a, b) => {
                const countA = a[1].count;
                const countB = b[1].count;
                return sortOrder === 'asc' ? countA - countB : countB - countA;
            })
        );
        setErrorCodes(newSortedErrorCodes);
    }, [sortOrder, errorCodes]);

    // Загружаем данные из API
    useEffect(() => {
        fetch(url)
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

                    setErrorCodes(codes);
                } else {
                    console.error('Неверные данные: data не массив');
                }
                setIsLoading(false);
            })
            .catch(error => console.error('Ошибка загрузки:', error));
    }, [url]);

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    // Фильтруем данные по введенному коду ошибки
    const filteredErrorCodes = Object.entries(errorCodes).filter(([code]) =>
        code.toLowerCase().includes(inputCode)
    );

    return (
        <div className="ErrorArr">
            <div>
                <input
                    type="text"
                    placeholder="Введите код ошибки"
                    value={inputCode}
                    onChange={handleInputChange}
                />
                <p>Описание: {getErrorDescription(inputCode)}</p>
            </div>

            <button onClick={toggleSortOrder}>
                Сортировка {sortOrder === 'asc' ? 'по убыванию' : 'по возрастанию'}
            </button>

            <ul>
                {filteredErrorCodes.map(([code, { count, description }]) => (
                    <li key={code}>
                        [{code}] - {description} <div className='Color_red'>Количество: ({count})</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ErrorArr;
