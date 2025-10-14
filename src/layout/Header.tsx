import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Mail } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <header className="w-full">
      <nav className="border-gray-200 bg-gray-900 py-2.5">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between px-4">
          <Link to="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white">
              Ballo
            </span>
          </Link>
          
          <div className="flex items-center lg:order-2">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none sm:mr-2 lg:px-5 lg:py-2.5 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  Trang chủ
                </Link>
                <Link 
                  to="/invitations" 
                  className="flex items-center space-x-1 rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none sm:mr-2 lg:px-5 lg:py-2.5 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  <Mail size={16} />
                  <span>Lời mời</span>
                </Link>
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
                <Link 
                  to="/register"
                  className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none sm:mr-2 lg:px-5 lg:py-2.5 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  Đăng Ký
                </Link>
                <Link 
                  to="/login"
                  className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 focus:outline-none sm:mr-2 lg:px-5 lg:py-2.5 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  Đăng Nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;