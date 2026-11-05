// fontsizeを定義しているのがPR中でマージ後に直す。忘れずに！！！！
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import TemplatePage from '../../layouts/TemplatePage';
import Calendar from '../../components/Calendar';
import Stepper from '../../components/Stepper';
import { RESERVATION_STEPS } from '../../types/reservation';
import { isHoliday } from '../../types/holiday';
import { fetchPatient } from '../../api/patients';
import { fetchReservations } from '../../api/reservations';
import type { AvailableDate, Patient, Reservation } from '../../types/management';
import { COURSES, DATE_FORMAT, TIME_SLOTS, CourseId } from '../../types/type';
import './style.css';

// 前の画面（患者新規登録）に戻るURL
const PATIENT_ENTRY_PATH = '/reservations/new';
// 次の画面（時間選択）のURL（未実装）
const TIME_SELECT_PATH = '/reservations/new/time';
// 今日から何日先まで予約を受け付けるか
const RESERVABLE_DAYS = 90;
// 1日に予約できる枠の数（isAvailable が true の時間だけ数える）
const SLOT_COUNT = TIME_SLOTS.filter((slot) => slot.isAvailable).length;
// エラーの文字色
const ERROR_COLOR = '#c62828';

// 前の画面から受け取るデータの型
type LocationState = { patientId?: string } | null;

// 土日祝なら true を返す（day() は 0 が日曜、6 が土曜）
const isClosedDay = (date: string) => {
  const day = dayjs(date).day();
  return day === 0 || day === 6 || isHoliday(date);
};

// 予約一覧から予約できる日の一覧を作る
const getAvailableDates = (reservations: Reservation[]): AvailableDate[] => {
  // 例：2026-11-05: 9
  const reservedCounts: Record<string, number> = {};
  reservations.forEach((reservation) => {
    // キャンセルされた予約は枠を使っていないので数えない
    if (reservation.status === 'cancel') return;
    // その日の予約数を1増やす
    reservedCounts[reservation.date] = (reservedCounts[reservation.date] ?? 0) + 1;
  });
  return Array.from({ length: RESERVABLE_DAYS }, (_, index) =>
    dayjs().add(index, 'day').format(DATE_FORMAT),
  )
    // 予約数が枠の数より少ない日だけ残す（埋まっている日は選べない）
    .filter((date) => (reservedCounts[date] ?? 0) < SLOT_COUNT)
    // 土日祝は休診なので予約できない
    .filter((date) => !isClosedDay(date))
    .map((date) => ({ date }));
};

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
        <Text fontSize="16px" color={ERROR_COLOR}>
          {loadErrorMessage}
        </Text>
      );
    }
    return (
      <>
        {/* 予約者 */}
        <Box bg="#fff" px="48px" py="24px" mb="32px">
          <Text fontSize="18px" color="#5b6680">
            予約者
            <Text as="span" fontWeight="bold" color="#000" mx="12px">
              {patient.name}
            </Text>
            {patient.nameKana}/{dayjs(patient.birthDate).format('YYYY年MM月DD日')}
          </Text>
        </Box>
        {/* 健診コース */}
        <Box bg="#fff" px="32px" py="24px" mb="24px">
          <Heading as="h2" fontSize="24px" fontWeight="bold" mb="16px">
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
                  fontSize="24px"
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
          <Heading as="h2" fontSize="24px" fontWeight="bold" mb="16px">
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
          <Text fontSize="16px" color={ERROR_COLOR} textAlign="center" mb="16px">
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
        <Button
          variant="outline"
          colorPalette="blue"
          bg="#fff"
          w="360px"
          h="65px"
          onClick={() => navigate(PATIENT_ENTRY_PATH)}
        >
          戻る
        </Button>
        {patient && (
          <Button
            bg="#3b5bdb"
            color="#fff"
            w="460px"
            h="90px"
            fontSize="24px"
            fontWeight="bold"
            onClick={goToTimeSelect}
          >
            時間を選択する
          </Button>
        )}
      </Flex>
    </TemplatePage>
  );
};

export default ReserveDate;
