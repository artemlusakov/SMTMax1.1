import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
// import { QueryClient, QueryClientProvider } from 'react-query';

import './index.css'
import Home from './Pages/Home/Home';
import Statistics from './Pages/Statistics/Statistics';
import Test from './Pages/Test/Test';


// const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home/>
  },
  {
    path: '/Test',
    element: <Test/>
  },
  {
    path: '/Statistics',
    element: <Statistics/>
  }
]);



createRoot(document.getElementById('root')!).render(

    <StrictMode>
      {/* <QueryClientProvider client={queryClient}> */}
        <RouterProvider router={router} />
      {/* </QueryClientProvider> */}
    </StrictMode>

)
