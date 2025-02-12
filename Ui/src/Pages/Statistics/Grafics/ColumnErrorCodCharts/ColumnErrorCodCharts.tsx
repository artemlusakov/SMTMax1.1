import { useEffect, useState, useMemo } from 'react';
import { useErrorCod } from './useErrorCod'; // Импортируем хук
import Chart from 'react-apexcharts';
import './ColumnErrorCodCharts.css';
import { getErrorDescription } from '../../../../Store/Warning/WarningDescription';

interface Props {
  url: string;
}

export default function ColumnErrorCodCharts({ url }: Props) {
  const { data: allData, isLoading, isError } = useErrorCod(url); // Используем хук для получения данных
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Мемоизируем данные с учетом сортировки и лимита
  const sortedData = useMemo(() => {
    if (!allData) return [];
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

  if (isError) {
    return <div>Произошла ошибка при загрузке данных.</div>;
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
        height={330} 
        width={"97%"} 
      />
    </div>
  );
}
