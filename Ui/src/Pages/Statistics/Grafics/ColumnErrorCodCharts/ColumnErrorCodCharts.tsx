import { useEffect, useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import './ColumnErrorCodCharts.css';
import { getErrorDescription } from '../../../../Store/Warning/WarningDescription';

interface Props {
  url: string;
}

interface DataItem {
  x: string;
  y: number;
}

export default function ColumnErrorCodCharts({ url }: Props) {
  const [dataArr, setDataArr] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [allData, setAllData] = useState<DataItem[]>([]);

  // Функция для загрузки данных
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: any[] = await response.json();

      if (Array.isArray(data)) {
        const filteredWarnings = data.filter(item => item.level === 'WARNING');
        const counts = filteredWarnings.reduce<{ [key: string]: number }>((acc, item) => {
          const code = item.message.match(/\[[a-zA-Z0-9]+\]/)?.[0].slice(1, -1) || '';
          acc[code] = (acc[code] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(counts).map(([code, count]) => ({
          x: code,
          y: count,
        }));

        setAllData(chartData);
      } else {
        console.error('Неверные данные: data не массив');
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Запускаем загрузку данных
  useEffect(() => {
    fetchData();
  }, [url]);

  // Мемоизируем данные с учетом сортировки и лимита
  const sortedData = useMemo(() => {
    const sorted = [...allData].sort((a, b) => (sortOrder === 'asc' ? a.y - b.y : b.y - a.y));
    return sorted.slice(0, limit);
  }, [allData, sortOrder, limit]);

  // Обновление данных при изменении лимита
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  // Переключение порядка сортировки
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  // Настройки для графика
  const options = {
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex }: any) => {
        const errorCode = sortedData[dataPointIndex].x;
        const count = sortedData[dataPointIndex].y;
        const description = getErrorDescription(errorCode) || 'Неизвестная ошибка';
        
        return `<div class="arrow_box">
                  <span>[${errorCode}] - ${count}</span>
                  <div>${description}</div>
                </div>`;
      },
    },
    xaxis: {
      categories: sortedData.map(item => item.x),
      labels: {
        formatter: (val: string) => val,
      },
    },
  };

  return (
    <div>
      <div className="filter-buttons">
        {[5, 10, 15, 20].map(limitOption => (
          <button
            key={limitOption}
            onClick={() => handleLimitChange(limitOption)}
            className={limit === limitOption ? 'active-button' : ''}
          >
            Top {limitOption}
          </button>
        ))}
      </div>
      <div className="sort-buttons">
        <button onClick={toggleSortOrder}>
          Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
        </button>
      </div>
      <Chart 
        options={options} 
        series={[{ name: 'Количество', data: sortedData.map(item => item.y) }]} 
        type="bar" 
        height={300} 
        width={"97%"} 
      />
    </div>
  );
}
