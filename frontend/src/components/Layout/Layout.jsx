import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../../pages/Home/Headers/Header'
import Footer from '../../pages/Home/Headers/Footer'
import { AuthContext } from '../../middleware/AuthContext'
import Loader from '../../pages/common/Loader'

const Layout = () => {
  const {loading} = useContext(AuthContext)
  if(loading) return <Loader/>
  return (
    <>
    <Header/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default Layout
