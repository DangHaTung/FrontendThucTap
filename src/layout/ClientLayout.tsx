import React from 'react'
import  { Outlet } from 'react-router'
import Header from '../layout/Header'

const ClientLayout = () => {
  return (
    <>
    <Header />
    <Outlet />
    </>
  )
}

export default ClientLayout