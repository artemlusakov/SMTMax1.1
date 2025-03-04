import React from 'react'

import './Home.css'

import Navigate from '../../Components/Navigate/Navigate';
import WorkingLineElement from '../Home/LineElement/WorkingLineElement'
import ItemList from '../../Components/Test/ItemList.jsx'

import { useState } from 'react';

export default function Home() {
  const elements = [
    {
       id: "e133415",
      link: '/Statistics', 
      size: "Element60x80",
      name:"CM 421", 
      title: "CM 421", 
      value: 100 
    },

    { 
      id: "e133415",
      link: '/Statistics', 
      size: "Element100x50",
      name:"Test", 
      title: "Какоето оборудование", 
      value: 1100 
    },
    {
      id: "e133415",
      link: '/Statistics',
      size: "Element60x80",
      name: "CM 421", 
      title: "CM 421", 
      value: 200 
      },

    { 
      id: "e133415",
      link: '/Statistics', 
      size: "Element60x80",
      name:"CM 421", 
      title: "CM 421", 
      value: 2000 
    },

    { 
      id: "e133415",
      link: '/Statistics', 
      size: "Element100x50",
      name:"Test", 
      title: "Какоето оборудование", 
      value: 100 
    },
  ];

  const [workingLineElements, setWorkingLineElements] = useState(elements);
  
  return (
    <div className='Home'>
      <Navigate/>

      <div className='Home_Row1'>
        {workingLineElements.map((item, index) => (
              <WorkingLineElement
                key={index}
                titleNameElemet={item.title}
                idElement={item.id}
                linkElement={item.link}
                nameElement={item.name}
                valueElement={item.value}
                size={item.size}
              />
            ))}
      </div>

      <div className='Home_Row2'>
            <div>
              <h3>Не эфективное</h3>
            </div>

            <ItemList/>
      </div>
    </div>
  )
}
