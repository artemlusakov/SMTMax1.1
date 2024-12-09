import React from 'react'
import './ColumnErrorCodCharts.css'
import Chart from 'react-apexcharts';

export default function ColumnErrorCodCharts() {
  return (
    <div>
        <Chart
          options={chartOptions} 
          series={[seriesData.done, Math.max(0, seriesData.totalItems - seriesData.done)]}
          type="bar"
          height={350}
        />
    </div>
  )
}
