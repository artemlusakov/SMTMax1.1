"use client"; // Добавьте эту директиву в начало файла

import React, { useState } from 'react';
import WorkingLineElement from './LineElement/WorkingLineElement';
import './Home.css';

export default function HomePage() {
  const elements = [
    {
      id: "e133415",
      link: '/Statistics',
      size: "Element60x80",
      name: "CM 421",
      title: "CM 421",
      value: 100
    },
    {
      id: "e133415",
      link: '/Statistics',
      size: "Element100x50",
      name: "Test",
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
      name: "CM 421",
      title: "CM 421",
      value: 2000
    },
    {
      id: "e133415",
      link: '/Statistics',
      size: "Element100x50",
      name: "Test",
      title: "Какоето оборудование",
      value: 100
    },
  ];

  const [workingLineElements, setWorkingLineElements] = useState(elements);

  return (
    <div className={"Home"}>
      <div className={"Home_Row1"}>
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

      <div className={"Home_Row2"}>
        <div>
          <h3>Не эфективное</h3>
        </div>
      </div>
    </div>
  );
}