import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

interface Props {
  url: string;
}

interface DataItemError {
  timestamp: string;
  level: string;
  message: string;
  feeder: string;
  head: string;
}

export default function ColumnErrorCodCharts(props: Props) {
  const dataArr = [
    { x: 'af1a', y: 100},
    { x: 'ff2q', y: 70},
    { x: '2040', y: 30},
    { x: '23da', y: 8},
    { x: '0010', y: 20},
    { x: '2021', y: 3},
    { x: '2042', y: 30},
    { x: '23d3', y: 8},
    { x: '0014', y: 20},
    { x: '2040', y: 30},
    { x: '23da', y: 8},
    { x: '0010', y: 20 },
    { x: '2021', y: 3},
    { x: '2042', y: 30},
    { x: '23d3', y: 8},
    { x: '0014', y: 20},
    { x: '2025', y: 3}
  ];

  const [selectedData, setSelectedData] = useState(dataArr);
  const [limit, setLimit] = useState(5);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    updateSelectedData();
  }, [limit, sortOrder]);

  const updateSelectedData = () => {
    let newData = [...dataArr];
    
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
        newData = dataArr.sort((a, b) => sortOrder === 'asc' ? a.y - b.y : b.y - a.y);
    }

    setSelectedData(newData);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const options = {
    // ... (оставьте текущие опции без изменений)
  };

  return (
    <div>
      <div className="filter-buttons">
        <button onClick={() => handleLimitChange(5)}>Top 5</button>
        <button onClick={() => handleLimitChange(10)}>Top 10</button>
        <button onClick={() => handleLimitChange(15)}>Top 15</button>
        <button onClick={() => handleLimitChange(20)}>Top 20</button>
      </div>
      <div className="sort-buttons">
        <button onClick={toggleSortOrder}>Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}</button>
      </div>
      <Chart 
        options={options} 
        series={[{ name: 'Количество', data: selectedData }]} 
        type="bar" 
        height={350} 
      />
    </div>
  );
}