import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import Login from './pages/Login';
import Home from './pages/Home';
import PatientNewEntry from './pages/PatientNewEntry';
import ReserveDate from './pages/ReserveDate';
import PatientDetail from './pages/PatientDetail';
import PatientEdit from './pages/PatientEdit';
import ReserveTime from './pages/ReserveTime';
import ReserveConfirm from './pages/ReserveConfirm';
import ReserveComplete from './pages/ReserveComplete';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.RESERVATION_NEW} element={<PatientNewEntry />} />
      {/* 患者新規登録の「日付を選択する」から遷移する */}
      <Route path={ROUTES.RESERVATION_DATE} element={<ReserveDate />} />
      {/* 編集画面の「保存する」「編集キャンセル」から戻ってくる */}
      <Route path={ROUTES.PATIENT_DETAIL} element={<PatientDetail />} />
      <Route path={ROUTES.PATIENT_EDIT} element={<PatientEdit />} />
      {/* 予約日登録の「時間を選択する」から遷移する */}
      <Route path={ROUTES.RESERVATION_TIME} element={<ReserveTime />} />
      <Route path={ROUTES.RESERVATION_CONFIRM} element={<ReserveConfirm />} />
      <Route path={ROUTES.RESERVATION_COMPLETE} element={<ReserveComplete />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
