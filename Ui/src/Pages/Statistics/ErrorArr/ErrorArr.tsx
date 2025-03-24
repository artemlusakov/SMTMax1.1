import { useState, useEffect } from 'react';
import { getErrorDescription } from '../../../Store/Warning/WarningDescription';
import './ErrorArr.css';

interface DataItem {
    timestamp: string;
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

    // Загружаем данные из API
    useEffect(() => {
        fetch(url)
            .then(response => response.json())
            .then((data: DataItem[]) => {
                if (Array.isArray(data)) {
                    const filteredErrors = data.filter(item => item.type === 'WARNING');
                    
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

    // Сортируем и фильтруем данные
    const sortedErrorCodes = Object.entries(errorCodes).sort((a, b) => {
        const countA = a[1].count;
        const countB = b[1].count;
        return sortOrder === 'asc' ? countA - countB : countB - countA;
    });

    const filteredErrorCodes = sortedErrorCodes.filter(([code]) =>
        code.toLowerCase().includes(inputCode)
    );

    return (
        <div className="ErrorArr">
        <div className="search-container">
            <input
                type="text"
                placeholder="Введите код ошибки"
                value={inputCode}
                onChange={handleInputChange}
            />
            {/* <div className="description-container">
                <p>Описание: {getErrorDescription(inputCode)}</p>
            </div> */}
        </div>

        <div className="sort-buttons">
            <button onClick={toggleSortOrder}>
                Сортировка {sortOrder === 'asc' ? 'по убыванию' : 'по возрастанию'}
            </button>
        </div>

        <div className="data-container">
            <div className="data-header">
                <div>Код ошибки</div>
                <div>Описание</div>
                <div>Количество</div>
            </div>
            <div className="data-body">
                {filteredErrorCodes.map(([code, { count, description }]) => (
                    <div className="data-row" key={code}>
                        <div>[{code}]</div>
                        <div>{description}</div>
                        <div className='Color_red'>{count}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
    );
};

export default ErrorArr;