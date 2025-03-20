import React, { useState, useEffect } from 'react';
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

    // Загрузка общего количества WARNING
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchWarningCount();
            setLoading(false);
        };
        fetchData();
    }, [fetchWarningCount]);

    // Загрузка данных из API
    useEffect(() => {
        fetch(props.url)
            .then(response => response.json())
            .then((data: DataItemError[]) => {
                setData(data);
                console.log('Data loaded:', data);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [props.url]);

    // Фильтрация данных по выбранным Head и Feeder
    useEffect(() => {
        if (data.length > 0) {
            const filteredEntries = data.filter(item =>
                item.head.includes(selectedHead) &&
                (item.feeder === selectFider || !selectFider) &&
                item.type === 'WARNING'
            );
            setFilteredCount(filteredEntries.length);
            console.log('Filtered entries:', filteredEntries);
        }
    }, [selectedHead, selectFider, data]);

    // Обработчик изменения выбранного Head
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedHead(event.target.value);
    };

    // Обработчик изменения ввода Feeder
    const fiderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.toUpperCase();
        setSelectFider(inputValue.replace(/[^A-Z0-9\s]/g, ''));
    };

    // Расчет процента WARNING
    const calculatePercentage = (): string => {
        if (warningCount === 0) return '0%';
        const percentage = ((filteredCount / warningCount) * 100).toFixed(2);
        return `${percentage}%`;
    };

    // Обновление labels для графика
    useEffect(() => {
        const labelsAllWarning: string = 'Количество ошибок со всеми Warning';
        const labelsWarningHead: string = `Количество WARNING с ${`${selectedHead} и ${selectFider ? `Fider ${selectFider}` : "Без Fider"}`}`;
        setLabels([labelsAllWarning, labelsWarningHead]);
    }, [warningCount, filteredCount, selectedHead, selectFider]);

    // Настройки для графика
    const chartOptions: any = {
        chart: {
            type: 'donut',
            width: 100,
            // height: 200,
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
            text: 'No data available',
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 0,
            style: {
                color: undefined,
                fontSize: '14px',
                fontFamily: undefined
            }
        }
    };

    // Данные для графика
    const chartSeries = [warningCount, Math.max(0, filteredCount)];

    if (loading) {
        return <p>Загрузка данных...</p>;
    }

    return (
        <div className='FiderChartDonats'>
            <h2>Анализ WARNING</h2>
            <div className="controls">
                <select value={selectedHead} onChange={handleSelectChange}>
                    <option value="Head1">Head1</option>
                    <option value="Head2">Head2</option>
                    <option value="Head3">Head3</option>
                    <option value="Head4">Head4</option>
                    <option value="Head5">Head5</option>
                    <option value="Head6">Head6</option>
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
                    Количество WARNING с {selectedHead} и {selectFider ? `Fider ${selectFider}` : "Без Fider"}:
                    <span> {filteredCount} ({calculatePercentage()})</span>
                </p>
            </div>
        </div>
    );
}