
import { Route, Routes } from "react-router";

import Register from "./components/Register";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import ClientLayout from "./layout/ClientLayout";
import { AuthProvider } from "./contexts/AuthContext";
import TrelloClone from "./components/TrelloClone";
import APITest from "./components/APITest";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<APITest />} />
        <Route path="/" element={
          <PrivateRoute>
            <ClientLayout />
            <TrelloClone/>
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
