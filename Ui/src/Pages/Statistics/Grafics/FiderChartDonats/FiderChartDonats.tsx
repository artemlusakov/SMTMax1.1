import React, { useState, useEffect, useMemo } from 'react';
import { useWarningCount } from '../../../../Store/Warning/useWarningCount';
import Chart from 'react-apexcharts';
import "./FiderChartDonats.css"

interface DataItemError {
    timestamp: string;
    level: string;
    message: string;
    feeder: string;
    head: string;
}

export default function FiderChartDonats() {
    const { warningCount, fetchWarningCount } = useWarningCount();

    const [filteredCount, setFilteredCount] = useState<number>(0);
    const [selectedHead, setSelectedHead] = useState<string>('Head1');
    const [selectFider, setSelectFider] = useState<string>('');
    const [data, setData] = useState<DataItemError[]>([]);
    const [labels, setLabels] = useState<string[]>([]);

    useEffect(() => {
        fetchWarningCount();
    }, []);

    useEffect(() => {
        fetch('/Error.json')
            .then(response => response.json())
            .then((data: DataItemError[]) => {
                setData(data);
                // Генерируем уникальные labels на основе данных
                const uniqueLabels = Array.from(new Set(data.map(item => item.head)));

            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            const filteredEntries = data.filter(item =>
                item.head.includes(selectedHead) &&
                (item.feeder === selectFider || !selectFider) &&
                item.level === 'WARNING'
            );
            setFilteredCount(filteredEntries.length);
        }
    }, [selectedHead, selectFider, data]);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedHead(event.target.value);
    };

    const fiderInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.toUpperCase();
        setSelectFider(inputValue.replace(/[^A-Z0-9\s]/g, ''));
    };

    const calculatePercentage = (): string => {
        if (warningCount === 0) return '0%';
        const percentage = ((filteredCount / warningCount) * 100).toFixed(2);
        return `${percentage}%`;
    };

    useEffect(() => {
        console.log('Warning count or Filtered count changed');

        const labelsAllWarning:string = 'Количество ошибок со всеми Warning';
        const labelsWarningHead:string = `Количество WARNING с ${`${selectedHead} и ${selectFider ? `Fider ${selectFider}` : "Без Fider"}`}`

        setLabels([labelsAllWarning,labelsWarningHead]);
    }, [warningCount, filteredCount]);

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

    const chartSeries = useMemo(() => [
        warningCount,
        Math.max(0, filteredCount)
    ], [warningCount, filteredCount]);

    return (
        <div className='FiderChartDonats'>
            <Chart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                height={180}
            />

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

            <p>Общее количество WARNING: {warningCount}</p>
            <p>
                Количество WARNING с {selectedHead} и {selectFider ? `Fider ${selectFider}` : "Без Fider"} : 
                {filteredCount} ({calculatePercentage()})
            </p>
        </div>
    );
}