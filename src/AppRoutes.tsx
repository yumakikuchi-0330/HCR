import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PatientNewEntry from './pages/PatientNewEntry';
import PatientDetail from './pages/PatientDetail';
import PatientEdit from './pages/PatientEdit';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/reservations/new" element={<PatientNewEntry />} />
      {/* 編集画面の「保存する」「編集キャンセル」から戻ってくる */}
      <Route path="/patients/:id" element={<PatientDetail />} />
      <Route path="/patients/:id/edit" element={<PatientEdit />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
