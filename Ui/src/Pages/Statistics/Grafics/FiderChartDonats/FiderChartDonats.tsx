import React, { useState, useEffect, useMemo } from 'react';
import { useWarningCount } from '../../../../Store/Warning/useWarningCount';
import Chart from 'react-apexcharts';
import "./FiderChartDonats.css";

interface DataItemError {
    datetime: string; // Изменили с timestamp на datetime
    type: string;     // Изменили с level на type
    message: string;
    feeder: string;
    head: string;
    feederID: string; // Добавили feederID
    part: string;     // Добавили part
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

    // Загрузка общего количества WARNING
    useEffect(() => {
        fetchWarningCount();
    }, [fetchWarningCount]);

    // Загрузка данных из API
    useEffect(() => {
        fetch(props.url)
            .then(response => response.json())
            .then((data: DataItemError[]) => {
                setData(data);
                console.log('Data loaded:', data); // Логируем данные для отладки
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [props.url]);

    // Фильтрация данных по выбранным Head и Feeder
    useEffect(() => {
        if (data.length > 0) {
            const filteredEntries = data.filter(item =>
                item.head.includes(selectedHead) &&
                (item.feeder === selectFider || !selectFider) &&
                item.type === 'WARNING' // Используем type вместо level
            );
            setFilteredCount(filteredEntries.length);
            console.log('Filtered entries:', filteredEntries); // Логируем отфильтрованные данные
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
        console.log('Warning count or Filtered count changed');

        const labelsAllWarning: string = 'Количество ошибок со всеми Warning';
        const labelsWarningHead: string = `Количество WARNING с ${`${selectedHead} и ${selectFider ? `Fider ${selectFider}` : "Без Fider"}`}`;

        setLabels([labelsAllWarning, labelsWarningHead]);
    }, [warningCount, filteredCount, selectedHead, selectFider]);

    // Настройки для графика
    const chartOptions: any = useMemo(() => ({
        chart: {
            type: 'donut',
            width: 250,
            height: 200,
        },
        labels: labels, // Используем labels из состояния компонента
        colors: ['#34C759', '#FF0000'],
        plotOptions: {
            pie: {
                donut: {
                    size: '45%',
                }
            }
        },
        pieChart: {
            customScale: 1.1
        },
        legend: {
            show: false
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
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
    }), [labels]); // Добавляем labels в зависимость useMemo

    // Данные для графика
    const chartSeries = useMemo(() => [
        warningCount,
        Math.max(0, filteredCount)
    ], [warningCount, filteredCount]);

    return (
        <div className='FiderChartDonats'>
            {/* График */}
            <Chart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                height={180}
            />

            {/* Управление выбором Head и Feeder */}
            <div>
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

            {/* Информация о WARNING */}
            <p>Общее количество WARNING: {warningCount}</p>
            <p>
                Количество WARNING с {selectedHead} и {selectFider ? `Fider ${selectFider}` : "Без Fider"} :
                {filteredCount} ({calculatePercentage()})
            </p>
        </div>
    );
}