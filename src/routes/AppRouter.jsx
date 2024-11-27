import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom'
import LoginForm from '../layout/LoginForm'
import RegisterForm from '../layout/RegisterForm'
import useAuth from '../hooks/useAuth'
import Header from '../layout/Header'
import UserHome from '../layout/UserHome'
import NewTodoForm from '../layout/NewTodoForm'
import Cart from '../layout/cart'
import ThankYouPage from '../layout/test'
import ProductDetail from '../layout/OrderDate/getProductById'
import Payment from '../layout/pay/Payment'
import Home from '../layout/Home'
import Officer from '../layout/Officer/Officer'


import Productpict from '../layout/Productpict'
import Profile from '../layout/profile'
import Adress from '../layout/pay/address'
import Paymentcarts from '../layout/pay/Paymentcarts'


import Adminproduct from '../layout/adminpage/adminproduct'
import Adminorder from '../layout/adminpage/adminorder'
import Admin from '../layout/adminpage/adminhome'
import Sidebar from '../layout/adminpage/Sidebar'
import Getuser from '../layout/adminpage/user'
import Adminpage from '../layout/adminpage/adminpage'
import Adminshow from '../layout/adminpage/adminshowproduct'




import Sidebar2 from '../layout/Officer/SidebarOfficer'

// Guest Router
const guestRouter = createBrowserRouter([
  {
    path: '/',
    element: <>
      <Header />
      <Outlet />
    </>,
    children: [
      { index: true, element: <LoginForm /> },
      { path: '/register', element: <RegisterForm /> },
      { path: '/homepage', element: <Home /> },
    ]
  }
])

const userRouter = createBrowserRouter([
  {
    path: '/',
    element: <>
      <Header />
      <Outlet />
    </>,
    children : [
      { index: true, element: <UserHome /> },
      { path: '/new', element: <NewTodoForm /> },
      { path: '/cart', element: <Cart /> },
      { path: '/product/:id', element: <ProductDetail /> },
      { path: '/payment/:id/Fs2224SbaRel2Ncvn123444Bncceddd101Mx12Z01', element: <Payment /> },
      { path: '/product01/', element: <Productpict /> },
      { path: '/profile', element: <Profile /> },
      { path: '/address', element: <Adress /> },
      { path: '/thank', element: <ThankYouPage /> },
      { path: '/pay', element: <Paymentcarts/>}
    
    ]
  }
])

const adminRouter = createBrowserRouter([
  {
    path: '/',
    element: <>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-80 p-4">
          <Outlet />
        </div>
      </div>
    </>,
    children : [
      { index: true, element: <Admin /> },
      { path: '/Add', element: <Adminproduct /> },
      { path: '/home', element: <Admin /> },
      { path: '/order', element: <Adminorder /> },
      { path: '/getuser', element: <Getuser /> },
      { path: '/adminpage', element: <Adminpage /> },
      { path: '/adminshow', element: <Adminshow /> },
    ]
  }
])

// Officer Router
const officerRouter = createBrowserRouter([
  {
    path: '/',
    element: <>
 <div className="flex">
        <Sidebar2 />
        <div className="flex-1 ml-[380px] p-4">
          <Outlet />
        </div>
      </div>
    </>,
    children : [
      { index: true, element: <Officer /> },
      { path: '/officer', element: <Officer /> },
      { path: '/Add', element: <Adminproduct /> },
      { path: '/adminshow', element: <Adminshow /> },
    ]
  }
])

// AppRouter
export default function AppRouter() {
  const {user} = useAuth();
  
  const finalRouter = user?.id 
    ? user?.role === 'ADMIN'
      ? adminRouter
      : user?.role === 'OFFICER'
        ? officerRouter
        : userRouter
    : guestRouter;
  
  return (
    <RouterProvider router={finalRouter} />
  );
}
