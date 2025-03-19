import React, { useState, useEffect } from 'react';

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
    const [feederIDPartMap, setFeederIDPartMap] = useState<{ [key: string]: string }>({}); // FeederID -> Part
    const [feederPartMap, setFeederPartMap] = useState<{ [key: string]: string }>({}); // Feeder -> Part
    const [combinedMap, setCombinedMap] = useState<{ [key: string]: { feederID?: string, part: string } }>({}); // Feeder -> { feederID?, part }
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    // Обработка данных для получения последних значений FeederID -> Part и Feeder -> Part
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

            setFeederIDPartMap(feederIDMap);
            setFeederPartMap(feederMap);
            setCombinedMap(combined);
            console.log('FeederID-Part map:', feederIDMap); // Логируем результат для отладки
            console.log('Feeder-Part map:', feederMap); // Логируем результат для отладки
            console.log('Combined map:', combined); // Логируем результат для отладки
        }
    }, [data]);

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="feeder-part-list">
            <h2>Таблица 1: FeederID и Part (feeder = "none")</h2>
            <table>
                <thead>
                    <tr>
                        <th>FeederID</th>
                        <th>Part</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(feederIDPartMap).map(([feederID, part]) => (
                        <tr key={feederID}>
                            <td>{feederID}</td>
                            <td>{part}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Таблица 2: Feeder и Part (feederID = "none")</h2>
            <table>
                <thead>
                    <tr>
                        <th>Feeder</th>
                        <th>Part</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(feederPartMap).map(([feeder, part]) => (
                        <tr key={feeder}>
                            <td>{feeder}</td>
                            <td>{part}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Таблица 3: Feeder, FeederID и Part</h2>
            <table>
                <thead>
                    <tr>
                        <th>Feeder</th>
                        <th>FeederID</th>
                        <th>Part</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(combinedMap).map(([feeder, { feederID, part }]) => (
                        <tr key={feeder}>
                            <td>{feeder}</td>
                            <td>{feederID || '-'}</td>
                            <td>{part}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}