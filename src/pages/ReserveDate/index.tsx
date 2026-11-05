import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
import Calendar from '../../components/Calendar';
import Stepper from '../../components/Stepper';
import { RESERVATION_STEPS } from '../../constants/reservation';
import { getAvailableDates } from '../../utils/reservation';
import { fetchPatient } from '../../api/patients';
import { fetchReservations } from '../../api/reservations';
import type { AvailableDate, Patient } from '../../types/management';
import { COURSES, CourseId } from '../../types/type';
import './style.css';

// 前の画面（患者新規登録）に戻るURL
const PATIENT_ENTRY_PATH = '/reservations/new';
// 次の画面（時間選択）のURL（未実装）
const TIME_SELECT_PATH = '/reservations/new/time';
// エラーの文字色
const ERROR_COLOR = '#c62828';

// 前の画面から受け取るデータの型
type LocationState = { patientId?: string } | null;

const ReserveDate = () => {
  const navigate = useNavigate();
  // 新規登録画面から navigate(..., { state: { patientId } }) で渡された患者ID
  const { patientId } = (useLocation().state as LocationState) ?? {};
  const [patient, setPatient] = useState<Patient | null>(null);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [courseId, setCourseId] = useState<CourseId | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!patientId);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(
    patientId ? null : '予約者の情報がありません。患者登録からやり直してください',
  );
  // 「時間を選択する」を押したときの入力エラー
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    // 患者IDがない（URLを直接開いた）ときは何もしない
    if (!patientId) return;
    const loadData = async () => {
      try {
        // 患者と予約一覧を同時に取得して、両方終わるまで待つ
        const [fetchedPatient, reservations] = await Promise.all([
          fetchPatient(patientId),
          fetchReservations(),
        ]);
        setPatient(fetchedPatient);
        setAvailableDates(getAvailableDates(reservations));
      } catch {
        setLoadErrorMessage('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [patientId]);
  const goToTimeSelect = () => {
    if (!courseId || !selectedDate) {
      setErrorMessage('健診コースと受診日を選択してください');
      return;
    }
    // 次の画面に、患者ID・コース・日付をまとめて渡す
    navigate(TIME_SELECT_PATH, { state: { patientId, courseId, date: selectedDate } });
  };
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    // 選び直したら前のエラーは消す
    setErrorMessage(null);
  };
  const handleSelectCourse = (id: CourseId) => {
    setCourseId(id);
    setErrorMessage(null);
  };
  // 読み込み中・取得エラー・本体のどれを出すかを決める
  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }
    // 取得に失敗した（または患者IDがない）ときは、カレンダーを出さない
    if (loadErrorMessage || !patient) {
      return (
        <Text fontSize="body" color={ERROR_COLOR}>
          {loadErrorMessage}
        </Text>
      );
    }
    return (
      <>
        {/* 予約者 */}
        <Box bg="#fff" px="48px" py="24px" mb="32px">
          <Text fontSize="label" color="#5b6680">
            予約者
            <Text as="span" fontWeight="bold" color="#000" mx="12px">
              {patient.name}
            </Text>
            {patient.nameKana}/{dayjs(patient.birthDate).format('YYYY年MM月DD日')}
          </Text>
        </Box>
        {/* 健診コース */}
        <Box bg="#fff" px="32px" py="24px" mb="24px">
          <Heading as="h2" fontSize="h2" fontWeight="bold" mb="16px">
            健診コース
          </Heading>
          <Flex gap="32px">
            {/* COURSES（人間ドック・定期健診・生活習慣病）を1つずつボタンにする */}
            {COURSES.map((course) => {
              // このボタンが選ばれているか
              const isSelected = course.courseId === courseId;
              return (
                <Button
                  key={course.courseId}
                  // 押したボタンが選ばれた状態かを、画面を読み上げる機能やテストに伝える
                  aria-pressed={isSelected}
                  onClick={() => handleSelectCourse(course.courseId)}
                  w="290px"
                  h="60px"
                  fontSize="h2"
                  fontWeight="bold"
                  borderRadius="0"
                  border="1px solid"
                  // 選ばれているときは青、選ばれていないときは白地に黒
                  borderColor={isSelected ? '#3b5bdb' : '#d9d9d9'}
                  bg={isSelected ? '#eef2ff' : '#fff'}
                  color={isSelected ? '#3b5bdb' : '#000'}
                >
                  {course.courseName}
                </Button>
              );
            })}
          </Flex>
        </Box>
        {/* 今は1番目の「日付選択」 */}
        <Box mb="24px">
          <Stepper steps={RESERVATION_STEPS} currentStep={0} />
        </Box>
        {/* 受診日のカレンダー */}
        <Box className="reserve-date" bg="#fff" px="80px" py="48px" mb="32px">
          <Heading as="h2" fontSize="h2" fontWeight="bold" mb="16px">
            受診日を選択
          </Heading>
          {/* events: 予約できる日,selectedDate: 選ばれている日、onSelect: 日付を押したとき */}
          <Calendar
            events={availableDates}
            selectedDate={selectedDate}
            onSelect={handleSelectDate}
          />
        </Box>
        {errorMessage && (
          <Text fontSize="body" color={ERROR_COLOR} textAlign="center" mb="16px">
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
        <AppButton
          variant="outline"
          text="戻る"
          onClick={() => navigate(PATIENT_ENTRY_PATH)}
        />
        {patient && (
          <AppButton size="large" text="時間を選択する" onClick={goToTimeSelect} />
        )}
      </Flex>
    </TemplatePage>
  );
};

export default ReserveDate;
