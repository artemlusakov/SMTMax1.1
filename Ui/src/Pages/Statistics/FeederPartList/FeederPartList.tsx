import { useState, useEffect } from 'react';
import './FeederPartList.css'; // Импортируем CSS

interface DataItem {
    datetime: string;
    type: string;
    message: string;
    feeder: string;
    head: string;
    feederID: string;
    part: string;
}

interface Props {
    url: string; // URL для загрузки Operate.json
}

export default function FeederPartList(props: Props) {
    const [data, setData] = useState<DataItem[]>([]);
    const [combinedMap, setCombinedMap] = useState<{ [key: string]: { feederID?: string, part: string } }>({}); // Feeder -> { feederID?, part }
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default'); // Состояние для сортировки
    const [searchQuery, setSearchQuery] = useState<string>(''); // Состояние для поиска

    // Загрузка данных из Operate.json
    useEffect(() => {
        fetch(props.url)
            .then(response => response.json())
            .then((data: DataItem[]) => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Ошибка загрузки данных');
                setLoading(false);
            });
    }, [props.url]);

    // Обработка данных для получения объединенной карты Feeder -> { feederID?, part }
    useEffect(() => {
        if (data.length > 0) {
            const feederIDMap: { [key: string]: string } = {}; // FeederID -> Part
            const feederMap: { [key: string]: string } = {}; // Feeder -> Part
            const combined: { [key: string]: { feederID?: string, part: string } } = {}; // Feeder -> { feederID?, part }

            data.forEach(item => {
                // Обрабатываем записи с FeederID и Part (feeder = "none")
                if (item.feederID && item.feederID.trim() !== "none" && item.part && item.part !== "none" && item.feeder === "none") {
                    const existingEntry = data.find(d => d.feederID === item.feederID && d.part === feederIDMap[item.feederID]);
                    if (!feederIDMap[item.feederID] || (existingEntry && new Date(item.datetime) > new Date(existingEntry.datetime))) {
                        feederIDMap[item.feederID] = item.part;
                    }
                }

                // Обрабатываем записи с Feeder и Part (feederID = "none")
                if (item.feeder && item.feeder !== "none" && item.part && item.part !== "none" && item.feederID.trim() === "none") {
                    const existingEntry = data.find(d => d.feeder === item.feeder && d.part === feederMap[item.feeder]);
                    if (!feederMap[item.feeder] || (existingEntry && new Date(item.datetime) > new Date(existingEntry.datetime))) {
                        feederMap[item.feeder] = item.part;
                    }
                }
            });

            // Создаем объединенную карту
            Object.entries(feederMap).forEach(([feeder, part]) => {
                combined[feeder] = { part };
            });

            Object.entries(feederIDMap).forEach(([feederID, part]) => {
                const feeder = Object.keys(feederMap).find(f => feederMap[f] === part);
                if (feeder) {
                    combined[feeder].feederID = feederID;
                }
            });

            setCombinedMap(combined);
            console.log('Combined map:', combined); // Логируем результат для отладки
        }
    }, [data]);

    // Функция для сортировки данных
    const getSortedData = () => {
        const entries = Object.entries(combinedMap);

        // Сортировка по умолчанию: сначала строки без "-", затем остальные
        if (sortOrder === 'default') {
            return entries.sort((a, b) => {
                const aHasMissing = a[1].feederID === '-' || !a[1].feederID;
                const bHasMissing = b[1].feederID === '-' || !b[1].feederID;

                if (aHasMissing && !bHasMissing) return 1;
                if (!aHasMissing && bHasMissing) return -1;
                return 0;
            });
        }

        // Сортировка по возрастанию feeder
        if (sortOrder === 'asc') {
            return entries.sort((a, b) => a[0].localeCompare(b[0]));
        }

        // Сортировка по убыванию feeder
        if (sortOrder === 'desc') {
            return entries.sort((a, b) => b[0].localeCompare(a[0]));
        }

        return entries;
    };

    // Функция для фильтрации данных по поисковому запросу
    const getFilteredData = () => {
        const sortedData = getSortedData();
        if (!searchQuery) return sortedData; // Если запрос пустой, возвращаем все данные

        // Фильтруем данные по feeder (игнорируем регистр)
        return sortedData.filter(([feeder]) =>
            feeder.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="feeder-part-list">
            {/* Поле поиска */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Поиск по Feeder..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Кнопки для сортировки */}
            <div className="sort-buttons">
                <button onClick={() => setSortOrder('default')}>По умолчанию</button>
                <button onClick={() => setSortOrder('asc')}>По возрастанию Feeder</button>
                <button onClick={() => setSortOrder('desc')}>По убыванию Feeder</button>
            </div>

            {/* Контейнер для данных с фиксированным размером и скроллом */}
            <div className="data-container">
                <div className="data-header">
                    <div>Feeder</div>
                    <div>FeederID</div>
                    <div>Part</div>
                </div>
                <div className="data-body">
                    {getFilteredData().map(([feeder, { feederID, part }]) => (
                        <div key={feeder} className="data-row">
                            <div>{feeder}</div>
                            <div>{feederID || '-'}</div>
                            <div>{part}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}