import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import './ColumnErrorCodCharts.css'
import { getErrorDescription } from '../../../../Store/Warning/WarningDescription';

interface Props {
  url: string;
}

interface DataItem {
  x: string;
  y: number;
}

export default function ColumnErrorCodCharts(props: Props) {
  const [dataArr, setDataArr] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState<number>(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [allData, setAllData] = useState<DataItem[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setIsLoading(true);
    fetch('/Error.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const filteredWarnings = data.filter(item => item.level === 'WARNING');
          
          const counts = filteredWarnings.reduce<{ [key: string]: number }>(
            (acc, item) => {
              const code = item.message.match(/\[[a-zA-Z0-9]+\]/)?.[0].slice(1, -1) || '';
              acc[code] = (acc[code] || 0) + 1;
              return acc;
            },
            {}
          );

          // Преобразуем объект counts в массив для графика
          const chartData = Object.entries(counts).map(([code, count]) => ({
            x: code,
            y: count
          }));

          setAllData(chartData);
          updateSelectedData();
        } else {
          console.error('Неверные данные: data не массив');
        }
      })
      .catch(error => console.error('Fetch error:', error))
      .finally(() => setIsLoading(false));
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    updateSelectedData();
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    updateSelectedData();
  };

  const updateSelectedData = () => {
    let newData = [...allData];
    
    switch(limit) {
      case 5:
        newData = newData.sort((a, b) => sortOrder === 'asc' ? a.y - b.y : b.y - a.y).slice(0, 5);
        break;
      case 10:
        newData = newData.sort((a, b) => sortOrder === 'asc' ? a.y - b.y : b.y - a.y).slice(0, 10);
        break;
      case 15:
        newData = newData.sort((a, b) => sortOrder === 'asc' ? a.y - b.y : b.y - a.y).slice(0, 15);
        break;
      case 20:
        newData = newData.sort((a, b) => sortOrder === 'asc' ? a.y - b.y : b.y - a.y).slice(0, 20);
        break;
      default:
        newData = allData.sort((a, b) => sortOrder === 'asc' ? a.y - b.y : b.y - a.y);
    }

    setDataArr(newData);
  };

  useEffect(() => {
    updateSelectedData();
  }, [limit, sortOrder]);

  // Добавляем этот эффект для первого рендера
  useEffect(() => {
    if (!isLoading && allData.length > 0) {
      updateSelectedData();
    }
  }, [isLoading, allData]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  const options = {
    tooltip: {
      custom: function({ seriesIndex, dataPointIndex }) {
        const errorCode = dataArr[dataPointIndex].x;
        const count = dataArr[dataPointIndex].y;
        const description = getErrorDescription(errorCode) || 'Неизвестная ошибка';
        
        return '<div class="arrow_box">' +
          `<span>[${errorCode}] - ${count} </span>` +
          `<div>${description}</div>`+
          '</div>'
      }
    },
    xaxis: {
      categories: dataArr.map(item => item.x),
      labels: {
        formatter: function(val: string) {
          return val; // Возвращаем значение как есть
        }
      }
    },
  };

  return (
    <div>
      <div className="filter-buttons">
        <button onClick={() => handleLimitChange(5)} className={limit === 5 ? 'active-button' : ''}>
            Top 5
        </button>
        <button onClick={() => handleLimitChange(10)} className={limit === 10 ? 'active-button' : ''}>
            Top 10
        </button>
        <button onClick={() => handleLimitChange(15)} className={limit === 15 ? 'active-button' : ''}>
            Top 15
        </button>
        <button onClick={() => handleLimitChange(20)} className={limit === 20 ? 'active-button' : ''}>
            Top 20
        </button>
      </div>
      <div className="sort-buttons">
        <button onClick={toggleSortOrder}>Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}</button>
      </div>
      <Chart 
        options={options} 
        series={[{ name: 'Количество', data: dataArr.map(item => item.y) }]} 
        type="bar" 
        height={300} 
        width={"97%"}
      />
    </div>
  );
}