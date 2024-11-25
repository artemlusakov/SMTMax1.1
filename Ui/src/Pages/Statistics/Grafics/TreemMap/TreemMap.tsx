// src/Pages/Statistics/Grafics/TreemMap/TreemMap.tsx

import React, { useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface TreemapProps {
  data: { x: string; y: number }[];
}

const TreemMap: React.FC<TreemapProps> = ({ data }) => {
  const [options, setOptions] = React.useState({
    chart: {
      type: 'treemap' as 'treemap',
      height: 300,
    },
    title: {
      text: 'Error Statistics',
    },
    dataLabels: {
      style: {
        colors: [ '#212121']
      }
    },
    
    colors: [],
  });

  React.useEffect(() => {
    if (!data || data.length === 0) {
      console.warn('Данные отсутствуют или пусты');
      setOptions(prev => ({
        ...prev,
        title: { text: 'Нет данных для отображения' },
      }));
      return;
    }

    const colorArray = data.map(item => colorByValue(item.y));
    
    setOptions(prev => ({
      ...prev,
      colors: colorArray,
    }));
  }, [data]);

  const colorByValue = (value: number): string => {
    if (value > 1500) return '#FF0000'; // Красный для высоких значений
    if (value > 1000) return '#FFFF00'; // Желтый для средних значений
    return '#00FF00'; // Зеленый для низких значений
  };

  return (
    <div className='ReactApexChart'>
      <ReactApexChart 
      options={options} 
      series={[{ data }]} 
      type="treemap" 
      height={420}/>
    </div>
  );
};

export default TreemMap;