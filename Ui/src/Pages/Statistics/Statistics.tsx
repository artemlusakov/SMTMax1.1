import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navigate from '../../Components/Navigate/Navigate';
import './Statistics.css';

// Импорт хуков
import { useCompletedTasks } from '../../Store/CompletedTasks/useCompletedTasks';
import { useAllError } from './AllError';

// Импорт компонентов графиков
import CompiledProductChartDonats from './Grafics/CompiledProductChartDonats/CompiledProductChartDonats';
import FiderChartDonats from './Grafics/FiderChartDonats/FiderChartDonats';
import ErrorArr from './ErrorArr/ErrorArr';
import DateAllWorks from './DateTime/DateAllWorks';
import ColumnErrorCodCharts from './Grafics/ColumnErrorCodCharts/ColumnErrorCodCharts';
import FeederPartList from '../Statistics/FeederPartList/FeederPartList';
import NoData from '../../Components/NoData/NoData';

export default function Statistics() {
  const { machineId } = useParams();
  
  // Формируем пути к JSON-файлам с использованием machineId
  const ERROR_JSON_URL = `/${machineId}/Error.json`;
  const OPERATE_JSON_URL = `/${machineId}/Operate.json`;

  // Получаем данные об ошибках
  const { fetchErrorData } = useAllError();
  const { completedTasks, fetchCompletedTasks } = useCompletedTasks();
  
  // Состояние для хранения общего количества деталей
  const [totalItemsValue, setTotalItemsValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Параллельная загрузка данных
        await Promise.all([
          fetchErrorData(),
          fetchCompletedTasks(machineId || '') // Передаем machineId
        ]);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (machineId) {
      fetchData();
    }
  }, [machineId, fetchErrorData, fetchCompletedTasks]);

  if (loading) {
    return (
      <div>
        <Navigate />
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigate />
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Navigate />

      <div className='Statistics Row_SA'>
        <div className='Statistics_Col-1 Col_SB'>
          <div className='Row_SB Row_Col-1'>
            <div className='Statistics_Box-min'>
              <FiderChartDonats url={ERROR_JSON_URL}/>
            </div>

            <div className='Statistics_Box-min Col_SA InputNum'>
              <CompiledProductChartDonats 
                seriesData={{ 
                  done: completedTasks, 
                  totalItems: totalItemsValue > 0 ? totalItemsValue : 0 
                }} 
              />
              <input 
                type="number" 
                min="0"
                placeholder='Желаемое количество деталей' 
                value={totalItemsValue || ''}
                onChange={(e) => setTotalItemsValue(Math.max(0, e.target.valueAsNumber || 0))}
                className="total-items-input"
              />
            </div>
          </div>

          <div className='Row_SB Row_Col-1'>
            <div className='Statistics_Box-min'>
              <DateAllWorks url={OPERATE_JSON_URL}/>
            </div>

            <div className='Statistics_Box-min'>
              <NoData 
                message="No data available" 
                icon="info"
              />
            </div>
          </div>

          <div className='Row_SB Row_Col-1'>
            <div className='Statistics_Box-min'>
              <NoData 
                message="Data loading failed"
                icon="warning"
                variant="warning"
              />
            </div>

            <div className='Statistics_Box-min'>
              <NoData
                icon="info"
              />
            </div>
          </div>
        </div>

        <div className='Statistics_Col-2 Col_SB'>
          <div className='Row_Col-2'>
            <div className='Statistics_Box-max'>
              <ColumnErrorCodCharts url={ERROR_JSON_URL}/>
            </div>
          </div>

          <div className='Row_Col-2 Row_SB'>
            <div className='Statistics_Box-min'>
              <h3>Список ошибок</h3>
              <ErrorArr url={ERROR_JSON_URL}/>
            </div>

            <div className='Statistics_Box-min'>
              <h3>Таблица: Feeder, FeederID и Part</h3>
              <FeederPartList url={OPERATE_JSON_URL}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}