import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { ROUTES } from '../../constants/routes';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
import Stepper from '../../components/Stepper';
import { RESERVATION_STEPS } from '../../constants/reservation';
import { fetchPatient } from '../../api/patients';
import { createReservation } from '../../api/reservations';
import type { Option, Patient } from '../../types/management';
import { COURSES, OPTIONS, type Course } from '../../types/type';
import './style.css';

const CURRENT_STEP = 2;

type ReservationParams = {
  patientId: string;
  course: Course;
  date: string;
  time: string;
  options: Option[];
};

const getReservationParams = (searchParams: URLSearchParams): ReservationParams | null => {
  const patientId = searchParams.get('patientId');
  const course = COURSES.find((item) => item.courseId === searchParams.get('courseId'));
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  if (!patientId || !course || !date || !time) {
    return null;
  }
  if (dayjs(date).format('YYYY-MM-DD') !== date) {
    return null;
  }
  const optionIds = searchParams.getAll('options');
  const options = OPTIONS.filter((option) => optionIds.includes(String(option.optionId)));
  return { patientId, course, date, time, options };
};

const ReserveConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = getReservationParams(searchParams);
  const patientId = params?.patientId;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!patientId) {
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
  }, [patientId]);
  const confirmReservation = async () => {
    if (isSubmitting || !params) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const reservation = await createReservation({
        patientId: params.patientId,
        courseId: params.course.courseId,
        date: params.date,
        time: params.time,
        options: params.options,
        status: 'before',
      });
      navigate(`${ROUTES.RESERVATION_COMPLETE}?reservationId=${reservation.id}`);
    } catch {
      setErrorMessage('予約の登録に失敗しました。もう一度お試しください');
      setIsSubmitting(false);
    }
  };
  const goBack = () => {
    if (!params) {
      navigate(ROUTES.RESERVATION_NEW);
      return;
    }
    const backParams = new URLSearchParams(searchParams);
    backParams.delete('time');
    navigate(`${ROUTES.RESERVATION_TIME}?${backParams}`);
  };
  return (
    <TemplatePage>
      {isLoading ? (
        <Spinner />
      ) : loadErrorMessage || !patient || !params ? (
        <Text fontSize="body" color="#c62828">
          {loadErrorMessage}
        </Text>
      ) : (
        <>
          <Box mb="32px">
            <Stepper steps={RESERVATION_STEPS} currentStep={CURRENT_STEP} />
          </Box>
          <Heading as="h2" fontSize="h2" fontWeight="bold" textAlign="center" mb="56px">
            予約内容の確認
          </Heading>
          <Box
            className="reserve-confirm"
            bg="#fff"
            w="900px"
            mx="auto"
            px="75px"
            py="8px"
            mb="64px"
          >
            <Flex className="reserve-confirm_row">
              <Text className="reserve-confirm_label" fontSize="label" color="#5b6680">
                患者
              </Text>
              <Text fontSize="body" fontWeight="bold">
                {patient.name}
                <Text as="span" fontSize="12px" fontWeight="normal" color="#b0b0b0" ml="12px">
                  {patient.nameKana}
                </Text>
              </Text>
            </Flex>
            <Flex className="reserve-confirm_row">
              <Text className="reserve-confirm_label" fontSize="label" color="#5b6680">
                健診内容
              </Text>
              <Text fontSize="body" fontWeight="bold">
                {params.course.courseName}
              </Text>
            </Flex>
            <Flex className="reserve-confirm_row">
              <Text className="reserve-confirm_label" fontSize="label" color="#5b6680">
                受診日時
              </Text>
              <Text fontSize="body" color="#3b5bdb">
                {dayjs(params.date).format('YYYY年M月D日')} {params.time}
              </Text>
            </Flex>
            <Flex className="reserve-confirm_row">
              <Text className="reserve-confirm_label" fontSize="label" color="#5b6680">
                オプション
              </Text>
              <Text fontSize="body" fontWeight="bold">
                {params.options.length === 0
                  ? '無し'
                  : params.options.map((option) => option.optionName).join('、')}
              </Text>
            </Flex>
          </Box>
          {errorMessage && (
            <Text fontSize="body" color="#c62828" textAlign="center" mb="16px">
              {errorMessage}
            </Text>
          )}
        </>
      )}
      <Flex justify="center" align="flex-end" gap="48px">
        <AppButton variant="outline" text="戻る" onClick={goBack} />
        {patient && <AppButton size="large" text="予約を確定する" onClick={confirmReservation} />}
      </Flex>
    </TemplatePage>
  );
};

export default ReserveConfirm;
