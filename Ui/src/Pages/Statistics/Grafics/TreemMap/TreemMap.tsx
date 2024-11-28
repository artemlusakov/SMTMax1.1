import React, { useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface TreemapProps {
  data: { x: string; y: number }[];
}

const TreemMap: React.FC<TreemapProps> = ({ data }) => {
  const [options, setOptions] = React.useState({
    chart: {
      type: 'treemap' as 'treemap',
      height: '100%',
    },
    title: {
      text: 'Статистика ошибок',
    },
    dataLabels: {
      style: {
        colors: [ '#fff']
      }
    },
    
    colors: [],
  });

  React.useEffect(() => {
    if (!data || data.length === 0) {
      console.warn('Данные отсутствуют или пусты не могу отрисовать график');
      setOptions(prev => ({
        ...prev,
        title: { text: 'Статистика ошибок' },
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
      height={425}
      />
    </div>
  );
};

export default TreemMap;