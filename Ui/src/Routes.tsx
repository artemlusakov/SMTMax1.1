import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from './Pages/Home/Home';
import Statistics from './Pages/Statistics/Statistics';
import Test from './Pages/Test/Test';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/Test',
    element: <Test />,
  },
  {
    path: '/Statistics',
    element: <Statistics />,
  },
]);
