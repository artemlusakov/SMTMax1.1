import React, { useEffect, useState } from 'react'
import Navigate from '../../Components/Navigate/Navigate'
import './Statistics.css'

// import из стора
import { useCompletedTasks } from '../../Store/CompletedTasks/CompletedTasks';



// import графиков
import ChartDonats from './Grafics/CompiledProductChartDonats/CompiledProductChartDonats';
import TreemMap from './Grafics/TreemMap/TreemMap';
import { useAllError } from './AllError';
import ErrorArr from '../../Components/ErrorArr/ErrorArr';





export default function Statistics() {

  const { errorData, fetchErrorData } = useAllError();

  useEffect(() => {
    fetchErrorData();
  }, []);

  const { completedTasks, fetchCompletedTasks } = useCompletedTasks();
  React.useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const [notDoneValue, setNotDoneValue] = useState(0)
  
    useEffect(() => {
      const input = document.getElementById('notDone')
      const handleInput = () => {
        setNotDoneValue(input?.valueAsNumber)
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
                  <input type="number" placeholder='Желаемое количество деталей' value={notDoneValue} onChange={(e) => setNotDoneValue(e.target.valueAsNumber)} />
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

              </div>
              <div className='Statistics_Box-min'>

              </div>
            </div>
        </div>

        <div className='Statistics_Col-2 Col_SB'>
          <div className='Row_Col-2'>
            <div className='Statistics_Box-max'>

              <TreemMap data = {
                                [
                                  { x: 'New Delhi', y: 1000 },
                                  { x: 'Kolkata', y: 2000 },
                                  { x: 'Mumbai', y: 1100 },
                                  { x: 'Ahmedabad', y: 200 },
                                  { x: 'Bangaluru', y: 1500 },
                                  { x: 'Pune', y: 301 },
                                  { x: 'Chennai', y: 710 },
                                  { x: 'Jaipur', y: 3000 },
                                  { x: 'Surat', y: 441 },
                                  { x: 'Hyderabad', y: 168 },
                                  { x: 'Lucknow', y: 228 },
                                  { x: 'Indore', y: 193 },
                                  { x: 'Kanpur', y: 2904 }
                                ]
                              }/>

            {/* {errorData.length > 0 ? (
                            <TreemMap data={errorData} />
                          ) : (
                            <p>Loading...</p>
                          )} */}

            </div>
          </div>

          <div className='Row_Col-2 Row_SB'>
            <div className='Statistics_Box-min'>
              <ErrorArr/>
            </div>

            <div className='Statistics_Box-min'></div>
          </div>
        </div>
      </div>
    </div>
  )
}
