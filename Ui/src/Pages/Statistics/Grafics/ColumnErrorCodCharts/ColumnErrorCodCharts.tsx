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
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    updateSelectedData();
  }, [limit]);

  const updateSelectedData = () => {
    let newData = [];
    switch(limit) {
      case 5:
        newData = dataArr.slice(0, 5);
        break;
      case 10:
        newData = dataArr.slice(0, 10);
        break;
      case 15:
        newData = dataArr.slice(0, 15);
        break;
      case 20:
        newData = dataArr.slice(0, 20);
        break;
      default:
        newData = dataArr;
    }
    setSelectedData(newData);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const options = {
    chart: {
      height: 350,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        dataLabels: {
          position: 'top',
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
  };

  return (
    <div>
      <div className="filter-buttons">
        <button onClick={() => handleLimitChange(5)}>Top 5</button>
        <button onClick={() => handleLimitChange(10)}>Top 10</button>
        <button onClick={() => handleLimitChange(15)}>Top 15</button>
        <button onClick={() => handleLimitChange(20)}>Top 20</button>
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