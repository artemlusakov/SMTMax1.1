import React, { useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface TreemapProps {
  data: { x: string; y: number }[];
}

const TreemMap: React.FC<TreemapProps> = ({ data }) => {
  const [options, setOptions] = React.useState({
    chart: {
      height: 350,
      type: 'treemap',
    },
    title: {
      text: 'Статистика ошибок'
    },
    legend: {
      show: false
    },
    plotOptions: {
      treemap: {
        enableShades: true,
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 50,
              color: '#00FF00'
            },
            {
              from: 50,
              to: 100,
              color: '#FFA500'
            },
            {
              from: 100,
              to: 300,
              color: '#FF0000'
            }
          ]
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
      },
      formatter: function(text, op) {
        return [text, op.value]
      },
      offsetY: -4
    }
  });

  useEffect(() => {
    if (!data || data.length === 0) {
      console.warn('Данные отсутствуют или пусты не могу отрисовать график');
      setOptions(prev => ({
        ...prev,
        title: { text: 'Статистика ошибок' },
      }));
      return;
    }

    // Мы можем просто использовать существующие options без изменений
    // так как colorScale уже настроен правильно
  }, [data]);

  return (
    <div className='ReactApexChart'>
      <ReactApexChart 
        options={options} 
        series={[{ data }]} 
        type="treemap" 
        height={350}
      />
    </div>
  );
};

export default TreemMap;