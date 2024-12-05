import React from 'react';
import Chart from 'react-apexcharts';
import './CompiledProductChartDonats.css'

// Определение интерфейса пропсов компонента
interface ChartDonatsProps {
  seriesData: {
    done: number;
    totalItems: number;
  };
  totalItemsValue: number;
}

export default function CompiledProductChartDonats({ seriesData, totalItemsValue }: ChartDonatsProps): JSX.Element {
  // Определяем опции для графика
  const chartOptions = {
    labels: ['Сделано', 'Не сделано'],
    colors: ['#34C759', '#FF0000'],
    plotOptions: {
      pie: {
        donut: {
          size: '30%'
        }
      },
      pieChart: {
        customScale: 1.1
      }
    },
    responsive: [{
      breakpoint: 500,
      options: {
        chart: {
          width: 100 
        }
      }
    }],
    chart: {
      events: {
        dataPointMouseEnter: function(event: any): void {
          event.target.style.cursor = "pointer";
        },
        dataPointMouseLeave: function(event: any): void {
          event.target.style.cursor = "default";
        }
      },
      toolbar: {
        show: false
      }
    }
  };

  // Рассчитываем общее количество деталей и завершенных деталей
  const completedItems = seriesData.done;


  return (
    <div>
      <Chart
        options={chartOptions} 
        series={[seriesData.done, Math.max(0, seriesData.totalItems - seriesData.done)]}
        type="donut"
        height={350}
      />
      
      <p>Сделано: {completedItems}</p>
      <p>Не сделано: {Math.max(0, seriesData.totalItems - seriesData.done)}</p>

    </div>
  );
}