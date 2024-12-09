import React, { useState } from 'react';
import Chart from 'react-apexcharts';

export default function ColumnErrorCodCharts() {
  const [state, setState] = useState({
    series: [{
      name: 'Количество',
      data: [
        { x: 'af1a', y: 10, name: 'Подъем крана' },
        { x: 'ff2q', y: 7, name: 'Точка не найдена' },
        { x: '2040', y: 30, name: 'Критическая ошибка' },
        { x: '23da', y: 8, name: 'Нет смазки' },
        { x: '0010', y: 20, name: 'Деталь ушла в стоп' },
        { x: '2021', y: 3, name: 'Точка доступа не доступна' },
        { x: '2042', y: 30, name: 'Критическая ошибка' },
        { x: '23d3', y: 8, name: 'Нет смазки' },
        { x: '0014', y: 20, name: 'Деталь ушла в стоп' },
        { x: '2040', y: 30, name: 'Критическая ошибка' },
        { x: '23da', y: 8, name: 'Нет смазки' },
        { x: '0010', y: 20, name: 'Деталь ушла в стоп' },
        { x: '2021', y: 3, name: 'Точка доступа не доступна' },
        { x: '2042', y: 30, name: 'Критическая ошибка' },
        { x: '23d3', y: 8, name: 'Нет смазки' },
        { x: '0014', y: 20, name: 'Деталь ушла в стоп' },
        { x: '2025', y: 3, name: 'Точка доступа не доступна' }
      ].sort((a, b) => b.y - a.y)
    }],
    options: {
      chart: {
        height: 350,
        type: 'bar',
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          dataLabels: {
            position: 'top', // top, center, bottom
          },
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      
      xaxis: {
        position: 'top',
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            }
          }
        },
        tooltip: {
          enabled: true,
        },
        onDatasetHover: {
          highlightDataSeries: false,
      }
        
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val:string) {
            return val;
          }
        }
      
      },
      title: {
        text: 'Monthly Error Code Distribution',
        floating: true,
        offsetY: 330,
        align: 'center',
        style: {
          color: '#444'
        }
      }
    },
  });


  const [selectedCount, setSelectedCount] = useState(10);

  const handleFilterClick = (count : number) => {
    setSelectedCount(count);
  };

  const filteredData = state.series[0].data.slice(0, selectedCount);


  return (
    <div>
      <div className="filter-buttons">
        <button onClick={() => handleFilterClick(5)}>Top 5</button>
        <button onClick={() => handleFilterClick(10)}>Top 10</button>
        <button onClick={() => handleFilterClick(15)}>Top 15</button>
        <button onClick={() => handleFilterClick(20)}>Top 20</button>
      </div>
      <Chart 
        options={state.options} 
        series={[{ ...state.series[0], data: filteredData }]} 
        type="bar" 
        height={350} 
      />
    </div>
  );
}