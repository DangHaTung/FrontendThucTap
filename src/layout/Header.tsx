import React from 'react'
import { Link } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  
  const { isAuthenticated, username, logout } = useAuth()

  return (
    <>
      <div>
        <header className="w-full">
          <nav className="border-gray-200 bg-gray-900 py-2.5">
            <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between px-4">
              <a href="#" className="flex items-center"><span className="self-center text-xl font-semibold whitespace-nowrap text-white">Tùng Nè</span></a>
              <div className="flex items-center lg:order-2">
                <a className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none sm:mr-2 lg:px-5 lg:py-2.5 dark:hover:bg-gray-700 dark:focus:ring-gray-800" href="/"
                ><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg></a>
                
                {isAuthenticated ? (
                  <>
                    <span className="text-white mr-4">Xin chào, {username}</span>
                    <button 
                      onClick={logout}
                      className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none sm:mr-2 lg:px-5 lg:py-2.5 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <a className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none sm:mr-2 lg:px-5 lg:py-2.5 dark:hover:bg-gray-700 dark:focus:ring-gray-800" > <Link to={`/register`}>Đăng Ký</Link></a>
                    <a className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none sm:mr-2 lg:px-5 lg:py-2.5 dark:hover:bg-gray-700 dark:focus:ring-gray-800" > <Link to={`/login`}>Đăng Nhập</Link></a>
                  </>
                )}
              </div>
              <div className="hidden w-full items-center justify-between lg:order-1 lg:flex lg:w-auto" id="mobile-menu-2">
         
              </div>
            </div>
          </nav>
        </header>
      </div></>
  )
}

export default Header