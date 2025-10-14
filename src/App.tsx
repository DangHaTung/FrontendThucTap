
import { Route, Routes, useNavigate, useParams } from "react-router";

import Register from "./components/Register";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import ClientLayout from "./layout/ClientLayout";
import { AuthProvider } from "./contexts/AuthContext";
import BoardList from "./components/BoardList";
import BoardDetail from "./components/BoardDetail";
import Invitations from "./components/Invitations";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <ClientLayout />
            <BoardListWrapper />
          </PrivateRoute>
        } />
        <Route path="/board/:boardId" element={
          <PrivateRoute>
            <ClientLayout />
            <BoardDetailWrapper />
          </PrivateRoute>
        } />
        <Route path="/invitations" element={
          <PrivateRoute>
            <ClientLayout />
            <InvitationsWrapper />
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

function BoardListWrapper() {
  const navigate = useNavigate();
  
  const handleBoardSelect = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  return <BoardList onBoardSelect={handleBoardSelect} />;
}

function BoardDetailWrapper() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };

  if (!boardId) {
    return <div>Board ID không hợp lệ</div>;
  }

  return <BoardDetail boardId={boardId} onBack={handleBack} />;
}

function InvitationsWrapper() {
  const navigate = useNavigate();
  
  const handleInvitationAccepted = () => {
    // Có thể thêm logic để refresh boards list nếu cần
    navigate('/');
  };

  return <Invitations onInvitationAccepted={handleInvitationAccepted} />;
}

export default App;
