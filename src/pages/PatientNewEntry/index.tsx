import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import {
  Box,
  Field,
  Flex,
  Heading,
  Input,
  RadioGroup,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
} from '@chakra-ui/react';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
import PatientInfo from '../../components/PatientInfo';
import { createPatient, fetchPatients } from '../../api/patients';
import type { Patient } from '../../types/management';
import type { PatientRequest } from '../../types/api';

// 入力フォームの値（性別は未選択があるため空文字も許可）
type PatientFormValues = Omit<PatientRequest, 'gender'> & {
  gender: Patient['gender'] | '';
};

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
const GENDERS: Patient['gender'][] = ['男性', '女性'];
const HOME_PATH = '/';
// 日付選択画面（未実装）
const DATE_SELECT_PATH = '/reservations/new/date';

// 氏名の空白（全角・半角）を除いて比較できる形にする
const normalizeName = (name: string) => name.replace(/\s/g, '');

// 「必須」のラベル
const RequiredMark = () => (
  <Text as="span" fontSize="12px" fontWeight="bold" color="#c62828" bg="#fdecea" px="4px">
    必須
  </Text>
);

// ラベル・入力欄・エラーをまとめた入力項目
type FormFieldProps = {
  label: string;
  isRequired?: boolean;
  errorMessage?: string;
  children: ReactNode;
};
const FormField = ({ label, isRequired = false, errorMessage, children }: FormFieldProps) => (
  <Field.Root invalid={!!errorMessage}>
    <Field.Label fontSize="label" fontWeight="bold" gap="8px">
      {label}
      {isRequired && <RequiredMark />}
    </Field.Label>
    {children}
    <Field.ErrorText>{errorMessage}</Field.ErrorText>
  </Field.Root>
);

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
    return (
      <SimpleGrid columns={2} gap="24px">
        <FormField label="フリガナ" isRequired errorMessage={errors.nameKana?.message}>
          <Input
            placeholder="ヤマダタロウ"
            {...register('nameKana', { required: 'フリガナを入力してください' })}
          />
        </FormField>
        <FormField label="健保">
          <Input placeholder="協会けんぽ" {...register('insurance')} />
        </FormField>
        <FormField label="住所">
          <Input placeholder="東京都新宿区西新宿1-1-1" {...register('address')} />
        </FormField>
        <FormField label="既往歴">
          <Input {...register('medicalHistory')} />
        </FormField>
        <Box gridColumn="1 / -1">
          <FormField label="連絡事項">
            <Textarea {...register('note')} />
          </FormField>
        </Box>
      </SimpleGrid>
    );
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
                  <RadioGroup.Root
                    // 登録済みの患者なら、その患者の性別を表示して変更不可にする
                    value={matchedPatient?.gender ?? field.value}
                    onValueChange={(details) => field.onChange(details.value)}
                    disabled={!!matchedPatient}
                  >
                    <Flex gap="16px">
                      {GENDERS.map((gender) => (
                        <RadioGroup.Item
                          key={gender}
                          value={gender}
                          flex="1"
                          border="1px solid #D9D9D9"
                          px="24px"
                          py="12px"
                        >
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontWeight="bold">{gender}</RadioGroup.ItemText>
                        </RadioGroup.Item>
                      ))}
                    </Flex>
                  </RadioGroup.Root>
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
