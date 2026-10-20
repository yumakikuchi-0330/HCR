import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
