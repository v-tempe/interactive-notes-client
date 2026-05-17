import 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {ConfigProvider} from 'antd';
import ruRU from 'antd/locale/ru_RU';

import Login from './pages/Login.jsx';
import Register from "./pages/Register.jsx";


function App() {
  return (
    <ConfigProvider locale={ruRU}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;