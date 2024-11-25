import React from 'react';
import Chart from 'react-apexcharts';
import './CompiledProductChartDonats.css'

// Определение интерфейса пропсов компонента
interface ChartDonatsProps {
  seriesData: {
    done: number;
    notDone: number;
  };
}

/**
 * Component for displaying a donut chart with information about completed and uncompleted tasks
 */
export default function ChartDonats({ seriesData }: ChartDonatsProps): JSX.Element {
  // Define chart options
  const chartOptions = {
    labels: ['Сделано', 'Не сделано'], // Labels for chart sectors
    colors: ['#34C759', '#FF0000'], // Colors for sectors: green for completed, red for not completed
    plotOptions: {
      pie: { // Common settings for circular charts
        donut: { // Settings for donut chart
          size: '30%' // Size of the donut chart as 45% of the container width
        }
      },
      pieChart: { // Additional settings for circular charts
        customScale: 1.1 // Increases chart scale by 10%
      }
    },
    responsive: [{ // Settings for adaptability when screen size changes
      breakpoint: 500,
      options: {
        chart: { // Settings for small screens
          width: 100 
        }
      }
    }],
    chart: { // Common settings for the chart
      events: { // Event handlers for chart elements
        dataPointMouseEnter: function(event: any): void { // Changes cursor when hovering over data point
          event.target.style.cursor = "pointer";
        },
        dataPointMouseLeave: function(event: any): void { // Returns to default cursor when leaving data point
          event.target.style.cursor = "default";
        }
      },
      toolbar: { // Toolbar settings
        show: false // Hides the toolbar
      }
    }
  };

  // Define series data for the chart
  const chartSeries = [
    seriesData.done, // Number of completed tasks
    Math.max(0, seriesData.notDone) // Maximum of zero and difference between target count and completed tasks
  ];

  return (
    <Chart
      options={chartOptions} 
      series={chartSeries}
      type="donut"
      height={350}
    />
  );
}