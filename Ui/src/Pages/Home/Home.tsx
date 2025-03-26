import './Home.css';
import Navigate from '../../Components/Navigate/Navigate';
import WorkingLineElement from '../Home/LineElement/WorkingLineElement';
import { useState } from 'react';

export default function Home() {
  const elements = [
    {
      id: "e133415",
      link: '/Statistics', 
      size: "element-card",
      name: "CM 421", 
      title: "CM 421", 
      value: 100,
      status: "operational" // добавлено новое поле для статуса
    },
    { 
      id: "e133416",
      link: '/Statistics', 
      size: "element-card-wide",
      name: "Test", 
      title: "Другое оборудование", 
      value: 1100,
      status: "warning"
    },
    {
      id: "e133417",
      link: '/Statistics',
      size: "element-card",
      name: "CM 421", 
      title: "CM 421", 
      value: 200,
      status: "operational"
    },
    { 
      id: "e133418",
      link: '/Statistics', 
      size: "element-card",
      name: "CM 421", 
      title: "CM 421", 
      value: 2000,
      status: "error"
    },
    { 
      id: "e133419",
      link: '/Statistics', 
      size: "element-card-wide",
      name: "Test", 
      title: "Другое оборудование", 
      value: 100,
      status: "maintenance"
    },
  ];

  const [workingLineElements] = useState(elements);
  
  return (
    <div className='home-container'>
      <Navigate/>

      <div className='dashboard'>
        <div className='equipment-section'>
          <h2 className='section-title'>Мониторинг оборудования</h2>
          <div className='equipment-grid'>
            {workingLineElements.map((item, index) => (
              <WorkingLineElement
                key={index}
                titleNameElemet={item.title}
                idElement={item.id}
                linkElement={item.link}
                nameElement={item.name}
                valueElement={item.value}
                size={item.size}
                status={item.status}
              />
            ))}
          </div>
        </div>

        <div className='performance-section'>
          <h3 className='section-title'>Эффективность работы</h3>
          <div className='performance-metrics'>
            <div className='metric-card'>
              <span className='metric-label'>Общая эффективность</span>
              <span className='metric-value'>87%</span>
            </div>
            <div className='metric-card warning'>
              <span className='metric-label'>Требует внимания</span>
              <span className='metric-value'>2 машины</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}