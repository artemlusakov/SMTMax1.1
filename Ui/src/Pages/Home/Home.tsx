import './Home.css';
import Navigate from '../../Components/Navigate/Navigate';
import WorkingLineElement from '../Home/LineElement/WorkingLineElement';
import { useState, useEffect, useMemo } from 'react';

// Определяем интерфейс на уровне модуля
interface DataObject {
  id: string;
  link: string; 
  size: string;
  name: string; 
  title: string; 
  value: number;
}

interface Metrics {
  efficiencyPercentage: number;
  attentionNeeded: number;
  errorMachineIds: string[];
  hasCriticalErrors: boolean;
  lastUpdated?: Date;
}

// Функция для имитации получения новых данных с сервера
const fetchEquipmentData = async (): Promise<DataObject[]> => {
  // В реальном приложении здесь был бы fetch запрос
  return [
    {
      id: "e133415",
      link: '/Statistics', 
      size: "element-card",
      name: "CM 421", 
      title: "CM 421", 
      value: Math.floor(Math.random() * 2000) + 100,
    },
    { 
      id: "e133416",
      link: '/Statistics', 
      size: "element-card-wide",
      name: "Test", 
      title: "Другое оборудование", 
      value: Math.floor(Math.random() * 2000) + 100,
    },
    {
      id: "e133417",
      link: '/Statistics',
      size: "element-card",
      name: "CM 421", 
      title: "CM 421", 
      value: Math.floor(Math.random() * 2000) + 100,
    },
    { 
      id: "e133418",
      link: '/Statistics', 
      size: "element-card",
      name: "CM 421", 
      title: "CM 421", 
      value: Math.floor(Math.random() * 2000) + 100,
    },
    { 
      id: "e133419",
      link: '/Statistics', 
      size: "element-card-wide",
      name: "Test", 
      title: "Другое оборудование", 
      value: Math.floor(Math.random() * 2000) + 100,
    },
  ];
};

export default function Home() {
  const [workingLineElements, setWorkingLineElements] = useState<DataObject[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Загружаем данные и обновляем каждые 5 секунд
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchEquipmentData();
      setWorkingLineElements(data);
      setLastUpdated(new Date());
    };

    loadData(); // Первоначальная загрузка
    const interval = setInterval(loadData, 5000); // Обновление каждые 5 сек

    return () => clearInterval(interval); // Очистка при размонтировании
  }, []);

  const metrics: Metrics = useMemo(() => {
    if (workingLineElements.length === 0) return {
      efficiencyPercentage: 0,
      attentionNeeded: 0,
      errorMachineIds: [],
      hasCriticalErrors: false
    };

    const elementsWithStatus = workingLineElements.map(item => ({
      ...item,
      status: item.value > 1500 ? 'error' : 
              item.value >= 1000 ? 'warning' : 'operational'
    }));

    const hasCriticalErrors = elementsWithStatus.some(item => item.status === 'error');
    const errorMachines = elementsWithStatus.filter(item => item.status === 'error');
    
    if (hasCriticalErrors) {
      return {
        efficiencyPercentage: 0,
        attentionNeeded: errorMachines.length + 
                        elementsWithStatus.filter(item => item.status === 'warning').length,
        errorMachineIds: errorMachines.map(m => m.id),
        hasCriticalErrors: true
      };
    }

    const totalValue = elementsWithStatus.reduce((sum, item) => sum + item.value, 0);
    const goodValue = elementsWithStatus
      .filter(item => item.status === 'operational')
      .reduce((sum, item) => sum + item.value, 0);
    
    const warningValue = elementsWithStatus
      .filter(item => item.status === 'warning')
      .reduce((sum, item) => sum + item.value * 0.5, 0);

    const efficiencyPercentage = totalValue > 0
      ? Math.round(((goodValue + warningValue) / totalValue) * 100)
      : 0;

    return {
      efficiencyPercentage,
      attentionNeeded: elementsWithStatus.filter(item => item.status !== 'operational').length,
      errorMachineIds: [],
      hasCriticalErrors: false,
      lastUpdated
    };
  }, [workingLineElements, lastUpdated]);

  return (
    <div className='home-container'>
      <Navigate/>

      <div className='dashboard'>
        <div className='last-updated'>
          Последнее обновление: {lastUpdated.toLocaleTimeString()}
        </div>

        <div className='equipment-section'>
          <h2 className='section-title'>Мониторинг оборудования</h2>
          <div className='equipment-grid'>
            {workingLineElements.map((item) => {
              const status = item.value > 1500 ? 'error' : 
                           item.value >= 1000 ? 'warning' : 'operational';
              return (
                <WorkingLineElement
                  key={item.id}
                  titleNameElemet={item.title}
                  idElement={item.id}
                  linkElement={item.link}
                  nameElement={item.name}
                  valueElement={item.value}
                  size={item.size}
                />
              );
            })}
          </div>
        </div>

        <div className='performance-section'>
          <h3 className='section-title'>Эффективность работы</h3>
          <div className='performance-metrics'>
            <div className={`metric-card ${metrics.hasCriticalErrors ? 'critical-error' : ''}`}>
              <span className='metric-label'>Общая эффективность</span>
              <span className='metric-value'>
                {metrics.efficiencyPercentage}%
                {metrics.hasCriticalErrors && (
                  <div className='error-alert blinking-text'>
                    СРОЧНО ИСПРАВЬТЕ: {metrics.errorMachineIds.join(', ')}
                  </div>
                )}
              </span>
            </div>
            <div className={`metric-card ${metrics.attentionNeeded > 0 ? 'warning' : ''}`}>
              <span className='metric-label'>Требует внимания</span>
              <span className='metric-value'>
                {metrics.attentionNeeded} {getMachineWord(metrics.attentionNeeded)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMachineWord(count: number): string {
  const cases = [2, 0, 1, 1, 1, 2];
  const words = ['машина', 'машины', 'машин'];
  return words[
    count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]
  ];
}