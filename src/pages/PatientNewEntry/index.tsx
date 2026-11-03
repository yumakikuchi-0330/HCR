import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { Box, Flex, Heading, Input, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
import FormField from '../../components/FormField';
import GenderRadio from '../../components/GenderRadio';
import PatientDetailFields from '../../components/PatientDetailFields';
import PatientInfo from '../../components/PatientInfo';
import { createPatient, fetchPatients } from '../../api/patients';
import type { Patient } from '../../types/management';
import type { PatientFormValues } from '../../types/type';

const DEFAULT_VALUES: PatientFormValues = {
  name: '',
  nameKana: '',
  birthDate: '',
  gender: '',
  insurance: '',
  address: '',
  medicalHistory: '',
  note: '',
};
const HOME_PATH = '/';
// 日付選択画面（未実装）
const DATE_SELECT_PATH = '/reservations/new/date';

// 氏名の空白（全角・半角）を除いて比較できる形にする
const normalizeName = (name: string) => name.replace(/\s/g, '');

const PatientNewEntry = () => {
  const navigate = useNavigate();
  // 登録済みの患者一覧（生年月日・氏名の照合に使う）
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    defaultValues: DEFAULT_VALUES,
    // 表示していない入力欄はチェック・送信の対象から外す
    shouldUnregister: true,
  });
  // 画面を開いたときに患者一覧を1回だけ取得する
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setPatients(await fetchPatients());
      } catch {
        setErrorMessage('患者データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    loadPatients();
  }, []);
  const name = watch('name');
  const birthDate = watch('birthDate');
  const isSearchReady = name.trim() !== '' && birthDate !== '';
  // 生年月日と氏名が両方一致する登録済みの患者
  const matchedPatient = isSearchReady
    ? patients.find(
        (patient) =>
          patient.birthDate === birthDate && normalizeName(patient.name) === normalizeName(name),
      )
    : undefined;
  const goToDateSelect = (patientId: string) => {
    navigate(DATE_SELECT_PATH, { state: { patientId } });
  };
  // 登録済みならそのまま日付選択へ、未登録なら患者を登録してから日付選択へ
  const onSubmit = async (values: PatientFormValues) => {
    if (matchedPatient) {
      goToDateSelect(matchedPatient.id);
      return;
    }
    setErrorMessage(null);
    try {
      const createdPatient = await createPatient({
        ...values,
        gender: values.gender as Patient['gender'],
      });
      goToDateSelect(createdPatient.id);
    } catch {
      setErrorMessage('患者の登録に失敗しました');
    }
  };
  // 下段：照合結果によって「患者情報の表示」か「新規入力欄」を出し分ける
  const renderPatientDetail = () => {
    if (isLoading) {
      return <Spinner />;
    }
    if (!isSearchReady) {
      return (
        <Text fontSize="body" color="#5b6680">
          生年月日と氏名を入力すると、登録済みの患者情報が表示されます
        </Text>
      );
    }
    if (matchedPatient) {
      return <PatientInfo patient={matchedPatient} />;
    }
    return <PatientDetailFields register={register} errors={errors} />;
  };
  return (
    <TemplatePage>
      {/* タイトルと登録キャンセルボタンの行 */}
      <Flex justify="space-between" align="flex-start" mb="32px">
        <Box>
          <Heading as="h1" fontSize="h1" fontWeight="bold" mb="16px">
            患者新規登録
          </Heading>
          <Text fontSize="text">
            <Text as="span" color="#c62828">
              必須
            </Text>
            の項目は必ず入力してください
          </Text>
        </Box>
        <AppButton variant="outline" text="登録キャンセル" onClick={() => navigate(HOME_PATH)} />
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 基本情報（生年月日・氏名・性別） */}
        <Box bg="#fff" p="32px" mb="32px">
          <Heading as="h2" fontSize="h2" fontWeight="bold" mb="24px">
            基本情報
          </Heading>
          <SimpleGrid columns={3} gap="40px">
            <FormField label="生年月日" isRequired errorMessage={errors.birthDate?.message}>
              <Input type="date" {...register('birthDate', { required: '生年月日を入力してください' })} />
            </FormField>
            <FormField label="氏名" isRequired errorMessage={errors.name?.message}>
              <Input placeholder="山田太郎" {...register('name', { required: '氏名を入力してください' })} />
            </FormField>
            <FormField label="性別" isRequired errorMessage={errors.gender?.message}>
              <Controller
                name="gender"
                control={control}
                // 登録済みの患者は性別が決まっているのでチェックしない
                rules={{ required: !matchedPatient && '性別を選択してください' }}
                render={({ field }) => (
                  <GenderRadio
                    // 登録済みの患者なら、その患者の性別を表示して変更不可にする
                    value={matchedPatient?.gender ?? field.value}
                    onChange={field.onChange}
                    disabled={!!matchedPatient}
                  />
                )}
              />
            </FormField>
          </SimpleGrid>
        </Box>
        {/* 患者情報（登録済みなら表示、未登録なら入力） */}
        <Box bg="#fff" p="32px" mb="32px" minH="240px">
          {renderPatientDetail()}
        </Box>
        {errorMessage && (
          <Text fontSize="body" color="#c62828" textAlign="center" mb="16px">
            {errorMessage}
          </Text>
        )}
        <Flex justify="center">
          <AppButton
            size="large"
            type="submit"
            text={isSubmitting ? '登録中…' : '日付を選択する'}
          />
        </Flex>
      </form>
    </TemplatePage>
  );
};

export default PatientNewEntry;
