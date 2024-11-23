import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import './index.css'
import Home from './Pages/Home/Home';
import Statistics from './Pages/Statistics/Statistics';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home/>
  },
  {
    path: '/CM421',
    element: <Statistics/>
  }
]);

createRoot(document.getElementById('root')!).render(

    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>

)
