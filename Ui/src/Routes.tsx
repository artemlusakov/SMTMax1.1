import { createBrowserRouter } from 'react-router-dom';
import Home from './Pages/Home/Home';
import Statistics from './Pages/Statistics/Statistics';
import Test from './Pages/Test/Test';
import DashBord from './Pages/DashBord/DashBord';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/DashBord',
    element: <DashBord />,
  },
  {
    path: '/Test',
    element: <Test />,
  },
  {
    path: "/Statistics/:machineId",
    element: <Statistics />,
  },
]);
