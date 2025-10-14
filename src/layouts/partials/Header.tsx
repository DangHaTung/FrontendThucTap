import { Link } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

const Header = () => {
  const { isAuthenticated, username, logout } = useAuth()

  return (
    <>
      <div className="relative z-[100]"> {/* ✅ thêm z-index cao */}
        <header className="w-full">
          <nav className="border-gray-200 bg-gray-900 py-2.5 shadow-lg">
            <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between px-4">
              
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span className="self-center text-xl font-semibold whitespace-nowrap text-white">
                  Ballo
                </span>
              </Link>

              {/* Nút điều khiển & Auth */}
              <div className="flex items-center lg:order-2 space-x-2">
                {/* Icon hình mặt trăng */}
                <Link
                  to="/"
                  className="rounded-lg border-2 border-white p-2 text-white hover:bg-gray-50 hover:text-gray-900 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    ></path>
                  </svg>
                </Link>

                {/* Auth */}
                {isAuthenticated ? (
                  <>
                    <span className="text-white mr-2">Xin chào, {username}</span>
                    <button
                      onClick={logout}
                      className="rounded-lg border-2 border-white px-4 py-2 text-sm font-medium text-white hover:bg-gray-50 hover:text-gray-900 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="rounded-lg border-2 border-white px-4 py-2 text-sm font-medium text-white hover:bg-gray-50 hover:text-gray-900 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                    >
                      Đăng Ký
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-lg border-2 border-white px-4 py-2 text-sm font-medium text-white hover:bg-gray-50 hover:text-gray-900 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                    >
                      Đăng Nhập
                    </Link>
                  </>
                )}
              </div>

              {/* Placeholder menu (nếu cần thêm sau) */}
              <div
                className="hidden w-full items-center justify-between lg:order-1 lg:flex lg:w-auto"
                id="mobile-menu-2"
              ></div>
            </div>
          </nav>
        </header>
      </div>
    </>
  )
}

export default Header
