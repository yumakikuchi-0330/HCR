import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ROUTES } from '../../constants/routes';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
import Stepper from '../../components/Stepper';
import { RESERVATION_STEPS } from '../../constants/reservation';
import { fetchPatient } from '../../api/patients';
import { createReservation } from '../../api/reservations';
import type { Patient } from '../../types/management';
import { COURSES } from '../../types/type';
import './style.css';

const CURRENT_STEP = 2;

const ReserveConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const course = COURSES.find((item) => item.courseId === searchParams.get('courseId'));
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 二重送信を防ぐためのフラグ
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!patientId || !course || !date || !time) {
      setLoadErrorMessage('予約の情報がありません。患者登録からやり直してください');
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      try {
        setPatient(await fetchPatient(patientId));
      } catch {
        setLoadErrorMessage('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [patientId, course, date, time]);
  const handleSelectTime = async () => {
    if (!patientId || !course || !date || !time || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const reservation = await createReservation({
        patientId,
        courseId: course.courseId,
        date,
        time,
        options: selectedOptions,
        status: 'before',
      });
      navigate(`${ROUTES.RESERVATION_COMPLETE}?reservationId=${reservation.id}`);
    } catch {
      setErrorMessage('予約の登録に失敗しました。もう一度お試しください');
      setIsSubmitting(false);
    }
  };
};
