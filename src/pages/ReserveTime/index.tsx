import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { ROUTES } from '../../constants/routes';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
import Stepper from '../../components/Stepper';
import TimeBox from '../../components/TimeBox';
import { RESERVATION_STEPS } from '../../constants/reservation';
import { getTimeSlots } from '../../utils/timeSlot';
import { fetchPatient } from '../../api/patients';
import { fetchReservationsDate } from '../../api/reservations';
import type { Patient } from '../../types/management';
import { COURSES, TimeSlot } from '../../types/type';
import './style.css';

const CURRENT_STEP = 1;

const ReserveTime = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  // URLのコースIDが存在するコースか確認する（存在しなければundefined）
  const course = COURSES.find((item) => item.courseId === searchParams.get('courseId'));
  const date = searchParams.get('date');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    // 前の画面から患者ID・コースID・日付のどれかが欠けていたら、取得せずにエラーを出す
    if (!patientId || !course || !date) {
      setLoadErrorMessage('予約の情報がありません。患者登録からやり直してください');
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      try {
        // 患者とその日の予約を同時に取得して、両方終わるまで待つ
        const [fetchedPatient, reservations] = await Promise.all([
          fetchPatient(patientId),
          fetchReservationsDate(date),
        ]);
        setPatient(fetchedPatient);
        setSlots(getTimeSlots(reservations));
      } catch {
        setLoadErrorMessage('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [patientId, course, date]);
  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setErrorMessage(null);
  };
  const goToConfirm = () => {
    if (!selectedTime) {
      setErrorMessage('受診時間を選択してください');
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set('time', selectedTime);
    navigate(`${ROUTES.RESERVATION_CONFIRM}?${params}`);
  };
  // 予約日画面に戻る（選んだコース・日付・オプションを残すため、受け取ったクエリをそのまま渡す）
  const goBack = () => {
    if (!patientId) {
      navigate(ROUTES.RESERVATION_NEW);
      return;
    }
    const backParams = new URLSearchParams(searchParams);
    navigate(`${ROUTES.RESERVATION_DATE}?${backParams}`);
  };
  // 読み込み中・取得エラー・本体のどれを出すか
  const renderContent = () => {
    // 読み込み中はスピナーを表示
    if (isLoading) {
      return <Spinner />;
    }
    // 取得に失敗したときは、時間の一覧を出さない
    if (loadErrorMessage || !patient || !course) {
      return (
        <Text fontSize="body" color="#c62828" mb="32px">
          {loadErrorMessage}
        </Text>
      );
    }
    return (
      <>
        {/* 選択中の内容（患者名/コース/選択した日付） */}
        <Box bg="#fff" px="32px" py="15px" mb="32px" pt="25px">
          <Text fontSize="label" color="#5b6680">
            選択中
            <Text as="span" fontWeight="bold" color="#000" ml="15px">
              {patient.name}/{course.courseName}/{dayjs(date).format('YYYY年M月D日')}
            </Text>
          </Text>
        </Box>
        {/* ステッパー */}
        <Box mb="32px">
          <Stepper steps={RESERVATION_STEPS} currentStep={CURRENT_STEP} />
        </Box>
        {/* 受診時間 */}
        <Box className="reserve-time" bg="#fff" px="32px" py="25px" mb="32px">
          <Heading as="h2" fontSize="h2" fontWeight="bold">
            受診時間を選択
          </Heading>
          <TimeBox slots={slots} selectedTime={selectedTime} onSelect={handleSelectTime} />
        </Box>
        {errorMessage && (
          <Text fontSize="body" color="#c62828" textAlign="center" mb="16px">
            {errorMessage}
          </Text>
        )}
      </>
    );
  };
  return (
    <TemplatePage>
      {renderContent()}
      <Flex justify="center" align="center" gap="96px">
        <AppButton variant="outline" text="戻る" onClick={goBack} />
        {patient && <AppButton size="large" text="予約を確認する" onClick={goToConfirm} />}
      </Flex>
    </TemplatePage>
  );
};

export default ReserveTime;
