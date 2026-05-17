import 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {ConfigProvider} from 'antd';
import ruRU from 'antd/locale/ru_RU';

import Login from './pages/Login.jsx';
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};


function App() {
  return (
    <ConfigProvider locale={ruRU}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;