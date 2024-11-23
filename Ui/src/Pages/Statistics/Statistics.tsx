import React, { useEffect, useState } from 'react'
import Navigate from '../../Components/Navigate/Navigate'
import './Statistics.css'
import ErrorChart from './Grafics/ErrorChart'
import { useCompletedTasks } from '../../Store/CompletedTasks/CompletedTasks';

import ChartDonats from './Grafics/CompiledProductChartDonats';

export default function Statistics() {



  const chartData = [
    {
      children: [
        { name: '[5805]', size: 2138 },
        { name: '[5101]', size: 1000 },
        { name: '[5804]', size: 1500 },
        { name: '[aa1f]', size: 100 },
        { name: '[5805]', size: 500 },
        { name: '[fe02]', size: 900 },
        { name: '[ab0d]', size: 444 },
        { name: '[aa1f]', size: 123 },
        { name: '[5201]', size: 50 },
        { name: '[aa1f]', size: 100 },
        { name: '[fe02]', size: 500 },
        { name: '[5804]', size: 900 },
        
      ]
    }
  ];

  const { completedTasks, fetchCompletedTasks } = useCompletedTasks();
  React.useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const [notDoneValue, setNotDoneValue] = useState(0)
  
    useEffect(() => {
      const input = document.getElementById('notDone')
      const handleInput = () => {
        setNotDoneValue(input?.valueAsNumber || 0)
      }
      
      input?.addEventListener('input', handleInput)
      
      return () => {
        input?.removeEventListener('input', handleInput)
      }
    }, [])


  return (
    <div>
      <Navigate/>
      
      <div className='Statistics Row_SA'>
        <div className='Statistics_Col-1 Col_SB'>
            <div className='Row_SB Row_Col-1'>
              <div className='Statistics_Box-min'>
                <h4>Поля ввода</h4>
              </div>

              <div className='Statistics_Box-min Col_SA'>
                <h4>Сделано деталей {completedTasks}</h4>
                  <ChartDonats seriesData={{ done: completedTasks, notDone: notDoneValue || 0 }} />
                  <input type="number" id='notDone' value={notDoneValue} onChange={(e) => setNotDoneValue(e.target.valueAsNumber)} />
              </div>
            </div>

            <div className='Row_SB Row_Col-1'>
              <div className='Statistics_Box-min'>
                <h4>Деталей в минуту</h4>
              </div>

              <div className='Statistics_Box-min'>
                <h4>Статистика за прошлую смену</h4>
              </div>
            </div>

            <div className='Row_SB Row_Col-1'>
              <div className='Statistics_Box-min'>
                <h4></h4>
              </div>
              <div className='Statistics_Box-min'>

              </div>
            </div>
        </div>

        <div className='Statistics_Col-2 Col_SB'>
          <div className='Row_Col-2'>
            <div className='Statistics_Box-max'>
              <ErrorChart data={chartData} />
            </div>
          </div>

          <div className='Row_Col-2 Row_SB'>
            <div className='Statistics_Box-min'></div>

            <div className='Statistics_Box-min'></div>
          </div>
        </div>
      </div>
    </div>
  )
}
