import React, { useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface TreemapProps {
  data: { x: string; y: number }[];
}

const TreemMap: React.FC<TreemapProps> = ({ data }) => {
  const [options, setOptions] = React.useState({
    chart: {
      height: 350,
      type: 'treemap' as const, // Явно указываем тип "treemap"
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
              to: 1000,
              color: '#00FF00'
            },
            {
              from: 1000,
              to: 1500,
              color: '#FFA500'
            },
            {
              from: 1500,
              to: Infinity,
              color: '#FF0000'
            }
          ]
        }
      },
      noData: {
        text: 'No data available',
        align: 'center' as const, // Указываем тип для align
        verticalAlign: 'middle' as const, // Указываем тип для verticalAlign
        offsetX: 0,
        offsetY: 0,
        style: {
            color: undefined,
            fontSize: '14px',
            fontFamily: undefined
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
      },
      formatter: function(text: string, op: { value: number }) {
        return `${text}: ${op.value}`; // Возвращаем строку вместо массива
      },
      offsetY: -1
    }
  });

  useEffect(() => {
    if (!data || data.length === 0) {
      console.warn('Данные отсутствуют или пусты, не могу отрисовать график');
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
        height={420}
      />
    </div>
  );
};

export default TreemMap;