import Chart from 'react-apexcharts';
import './CompiledProductChartDonats.css';

// Определение интерфейса пропсов компонента
interface ChartDonatsProps {
  seriesData: {
    done: number;
    totalItems: number;
  };
  totalItemsValue: number;
}

export default function CompiledProductChartDonats({ seriesData }: ChartDonatsProps): JSX.Element {
  // Определяем опции для графика
  const chartOptions = {
    labels: ['Сделано', 'Не сделано'],
    colors: ['#34C759', '#FF0000'],
    plotOptions: {
      pie: {
        donut: {
          size: '30%', // Размер доната
        },
      },
    },
    responsive: [
      {
        breakpoint: 500,
        options: {
          chart: {
            width: 50, // Уменьшили в 2 раза (было 100)
          },
        },
      },
    ],
    noData: {
      text: 'No data',
      align: 'center' as const, // Убедитесь, что align имеет тип "center" | "left" | "right"
      verticalAlign: 'middle' as const, // Убедитесь, что verticalAlign имеет тип "middle" | "top" | "bottom"
      offsetX: 0,
      offsetY: 0,
      style: {
        color: undefined,
        fontSize: '12px', // Уменьшили шрифт (было 14px)
        fontFamily: undefined,
      },
    },
    chart: {
      events: {
        dataPointMouseEnter: function (event: any): void {
          event.target.style.cursor = 'pointer';
        },
        dataPointMouseLeave: function (event: any): void {
          event.target.style.cursor = 'default';
        },
      },
      toolbar: {
        show: false,
      },
    },
  };

  // Рассчитываем общее количество деталей и завершенных деталей
  const completedItems = seriesData.done;

  return (
    <div className="compiled-product-chart">
      <h2>Сделано деталей</h2>
      <Chart
        options={chartOptions}
        series={[seriesData.done, Math.max(0, seriesData.totalItems - seriesData.done)]}
        type="donut"
        height={175} 
      />

      <p>Сделано: {completedItems}</p>
      <p>Не сделано: {Math.max(0, seriesData.totalItems - seriesData.done)}</p>
    </div>
  );
}