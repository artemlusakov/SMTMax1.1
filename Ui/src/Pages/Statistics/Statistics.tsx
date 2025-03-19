import React, { useEffect, useState } from 'react'
import Navigate from '../../Components/Navigate/Navigate'
import './Statistics.css'


// Импорт хуков
import { useCompletedTasks } from '../../Store/CompletedTasks/useCompletedTasks';
import { useAllError } from './AllError';


// Импорт компонентов графиков
import CompiledProductChartDonats from './Grafics/CompiledProductChartDonats/CompiledProductChartDonats';
// import TreemMap from './Grafics/TreemMap/TreemMap';
import ErrorArr from './ErrorArr/ErrorArr';
import FiderChartDonats from './Grafics/FiderChartDonats/FiderChartDonats';

// Импорт данных
import DateAllWorks from './DateTime/DateAllWorks';
// import TreemMapArr from '../../Store/TreemMap/useTreemMapArr';
import ColumnErrorCodCharts from './Grafics/ColumnErrorCodCharts/ColumnErrorCodCharts';

import DataTest from '../Statistics/Grafics/ColumnErrorCodCharts/testArr';
import FeederPartList from '../Statistics/FeederPartList/FeederPartList';


export default function Statistics() {
  // Получаем данные об ошибках
  const { errorData, fetchErrorData } = useAllError();

  useEffect(() => {
    fetchErrorData();
  }, []);

  // Получаем данные о завершенных задачах
  const { completedTasks, fetchCompletedTasks } = useCompletedTasks();

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  // Состояние для хранения общего количества деталей
  const [TotalItemsValue, setTotalItemsValue] = useState(0);


   const ERROR_JSON_URL : string = '../../../public/Error.json';
   const OPERATE_JSON_URL : string = '../../../public/Operate.json'


  return (
    <div>
      <Navigate/>

      <div className='Statistics Row_SA'>
        <div className='Statistics_Col-1 Col_SB'>
          <div className='Row_SB Row_Col-1'>
            <div className='Statistics_Box-min'>
              <h4>Ошибки по фидеру</h4>
              <FiderChartDonats url={ERROR_JSON_URL}/>
            </div>

            <div className='Statistics_Box-min Col_SA InputNum'>
              <h4>Сделано деталей {completedTasks}</h4>
              <CompiledProductChartDonats 
                seriesData={{ done: completedTasks, totalItems: TotalItemsValue || 0 }} 
                totalItemsValue={TotalItemsValue}
              />
              <input 
                type="number" 
                placeholder='Желаемое количество деталей' 
                value={TotalItemsValue} 
                onChange={(e) => setTotalItemsValue(e.target.valueAsNumber)}
              />
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
              <DataTest />
            </div>
          </div>
        </div>

        <div className='Statistics_Col-2 Col_SB'>
          <div className='Row_Col-2'>
            <div className='Statistics_Box-max'>
              {/* <TreemMap  data={TreemMapArr()} />               */}
              <ColumnErrorCodCharts url={ERROR_JSON_URL}/>
            </div>
          </div>

          <div className='Row_Col-2 Row_SB'>
            <div className='Statistics_Box-min'>
              <h3>Список ошибок</h3>
              <ErrorArr url={ERROR_JSON_URL}/>
            </div>

            <div className='Statistics_Box-min'>
              {/* <DateAllWorks url={OPERATE_JSON_URL}/> */}

              <FeederPartList url={OPERATE_JSON_URL}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}