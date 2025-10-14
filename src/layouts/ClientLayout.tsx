
import  { Outlet } from 'react-router'
import Header from './partials/Header'

const ClientLayout = () => {
  return (
    <>
    <Header />
    <Outlet />
    </>
  )
}

export default ClientLayout