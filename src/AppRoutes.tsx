import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PatientNewEntry from './pages/PatientNewEntry';
import ReserveDate from './pages/ReserveDate';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/reservations/new" element={<PatientNewEntry />} />
      {/* 患者新規登録の「日付を選択する」から遷移する */}
      <Route path="/reservations/new/date" element={<ReserveDate />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
