import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { ROUTES } from '../../constants/routes';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
import Stepper from '../../components/Stepper';
import { RESERVATION_STEPS } from '../../constants/reservation';
import { fetchReservation } from '../../api/reservations';
import { fetchPatient } from '../../api/patients';
import type { Patient, Reservation } from '../../types/management';
import { COURSES } from '../../types/type';
import './style.css';

const CURRENT_STEP = 2;

const ReserveComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reservationId) {
      setErrorMessage('予約の情報がありません');
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      try {
        // 予約を取ってから、その予約の患者を取る（patientIdが必要なので順番に）
        const reservationData = await fetchReservation(reservationId);
        setReservation(reservationData);
        setPatient(await fetchPatient(reservationData.patientId));
      } catch {
        setErrorMessage('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [reservationId]);
  const course = COURSES.find((item) => item.courseId === reservation?.courseId);
  const goToPatientDetail = () => {
    if (!patient) return;
    navigate(ROUTES.PATIENT_DETAIL.replace(':id', patient.id));
  };
  return (
    <TemplatePage>
      <Box mb="48px">
        <Stepper steps={RESERVATION_STEPS} currentStep={CURRENT_STEP} />
      </Box>
      {isLoading ? (
        <Spinner />
      ) : errorMessage || !reservation || !patient ? (
        <Box textAlign="center">
          <Text fontSize="body" color="#c62828" mb="24px">
            {errorMessage}
          </Text>
          <AppButton
            size="large"
            variant="outline"
            text="ホームに戻る"
            onClick={() => navigate(ROUTES.HOME)}
          />
        </Box>
      ) : (
        <Box className="reserve-complete" bg="#fff" w="900px" mx="auto" px="75px" py="40px">
          <Flex className="reserve-complete_icon" mx="auto" mb="24px">
            ✓
          </Flex>
          <Heading as="h2" fontSize="body" fontWeight="bold" textAlign="center" mb="32px">
            予約が完了しました
          </Heading>
          <Box className="reserve-complete_summary" bg="#f5f7fa" py="24px" mb="56px">
            <Box w="fit-content" mx="auto">
              <Flex className="reserve-complete_row">
                <Text className="reserve-complete_label">患者</Text>
                <Text fontWeight="bold">{patient.name}</Text>
              </Flex>
              <Flex className="reserve-complete_row">
                <Text className="reserve-complete_label">健診内容</Text>
                <Text fontWeight="bold">{course?.courseName}</Text>
              </Flex>
              <Flex className="reserve-complete_row">
                <Text className="reserve-complete_label">受診日時</Text>
                <Text color="#3b5bdb">
                  {dayjs(reservation.date).format('YYYY年M月D日')} {reservation.time}
                </Text>
              </Flex>
              <Flex className="reserve-complete_row">
                <Text className="reserve-complete_label">オプション</Text>
                <Text fontWeight="bold">
                  {reservation.options.length === 0
                    ? '無し'
                    : reservation.options.map((option) => option.optionName).join('、')}
                </Text>
              </Flex>
            </Box>
          </Box>
          <Flex justify="center" gap="24px">
            <AppButton size="large" text="予約を確認する" onClick={goToPatientDetail} />
            <AppButton
              size="large"
              variant="outline"
              text="ホームに戻る"
              onClick={() => navigate(ROUTES.HOME)}
            />
          </Flex>
        </Box>
      )}
    </TemplatePage>
  );
};

export default ReserveComplete;
