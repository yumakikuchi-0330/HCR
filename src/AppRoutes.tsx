import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PatientNewEntry from './pages/PatientNewEntry';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      {/* HOMEの「新規予約」から遷移する */}
      <Route path="/reservations/new" element={<PatientNewEntry />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
