import React, { useState, useEffect, useCallback } from 'react';
import { useWarningCount } from '../../../../Store/Warning/useWarningCount';
import Chart from 'react-apexcharts';
import "./FiderChartDonats.css";

interface DataItemError {
    datetime: string;
    type: string;
    message: string;
    feeder: string;
    head: string;
    feederID: string;
    part: string;
}

interface Props {
    url: string;
}

export default function FiderChartDonats(props: Props) {
    const { warningCount, fetchWarningCount } = useWarningCount();
    const [filteredCount, setFilteredCount] = useState<number>(0);
    const [selectedHead, setSelectedHead] = useState<string>('Head1');
    const [selectFider, setSelectFider] = useState<string>('');
    const [data, setData] = useState<DataItemError[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Извлекаем machineId из URL
    const extractMachineId = useCallback(() => {
        const matches = props.url.match(/\/([^\/]+)\/Error\.json$/);
        return matches ? matches[1] : null;
    }, [props.url]);

    // Загрузка общего количества WARNING
    useEffect(() => {
        const machineId = extractMachineId();
        if (!machineId) {
            setError('Не удалось определить machineId из URL');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                await fetchWarningCount(machineId);
                setError(null);
            } catch (err) {
                setError('Ошибка при загрузке количества предупреждений');
                console.error('Error fetching warning count:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [fetchWarningCount, extractMachineId]);

    // Загрузка данных из API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(props.url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: DataItemError[] = await response.json();
                setData(data);
                setError(null);
            } catch (err) {
                setError('Ошибка при загрузке данных');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [props.url]);

    // Фильтрация данных по выбранным Head и Feeder
    useEffect(() => {
        if (data.length > 0) {
            const filteredEntries = data.filter(item =>
                item.head.includes(selectedHead) &&
                (selectFider ? item.feeder === selectFider : true) &&
                item.type === 'WARNING'
            );
            setFilteredCount(filteredEntries.length);
        }
    }, [selectedHead, selectFider, data]);

    // Обработчики событий
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedHead(event.target.value);
    };

    const fiderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.toUpperCase();
        setSelectFider(inputValue.replace(/[^A-Z0-9\s]/g, ''));
    };

    // Расчет процента WARNING
    const calculatePercentage = useCallback((): string => {
        if (warningCount === 0) return '0%';
        const percentage = ((filteredCount / warningCount) * 100).toFixed(2);
        return `${percentage}%`;
    }, [warningCount, filteredCount]);

    // Обновление labels для графика
    useEffect(() => {
        const labelsAllWarning = 'Количество ошибок со всеми Warning';
        const labelsWarningHead = `Количество WARNING с ${selectedHead}${selectFider ? ` и Fider ${selectFider}` : ''}`;
        setLabels([labelsAllWarning, labelsWarningHead]);
    }, [selectedHead, selectFider]);

    // Настройки для графика
    const chartOptions = {
        chart: {
            type: 'donut',
            width: 100,
        },
        labels: labels,
        colors: ['#34C759', '#FF0000'],
        plotOptions: {
            pie: {
                donut: {
                    size: '45%',
                }
            }
        },
        legend: {
            show: false
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 100
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        noData: {
            text: 'Нет данных',
            align: 'center',
            verticalAlign: 'middle',
            style: {
                color: undefined,
                fontSize: '14px',
                fontFamily: undefined
            }
        }
    };

    const chartSeries = [warningCount, Math.max(0, filteredCount)];

    if (loading) {
        return <div className="loading">Загрузка данных...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className='FiderChartDonats'>
            <h2>Анализ WARNING</h2>
            <div className="controls">
                <select value={selectedHead} onChange={handleSelectChange}>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={`Head${num}`} value={`Head${num}`}>Head{num}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder='Введите Fider'
                    value={selectFider}
                    onChange={fiderInputChange}
                    pattern="^[A-Z0-9\s]+$"
                />
            </div>
            <div className="chart-container">
                <Chart
                    options={chartOptions}
                    series={chartSeries}
                    type="donut"
                    height={180}
                />
            </div>
            <div className="info">
                <p>Общее количество WARNING: <span>{warningCount}</span></p>
                <p>
                    Количество WARNING с {selectedHead}{selectFider && ` и Fider ${selectFider}`}:
                    <span> {filteredCount} ({calculatePercentage()})</span>
                </p>
            </div>
        </div>
    );
}