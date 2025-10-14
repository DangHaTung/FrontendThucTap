
import { Outlet } from 'react-router';
import Header from './Header';

const ClientLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default ClientLayout;