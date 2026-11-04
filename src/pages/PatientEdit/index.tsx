import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { Box, Flex, Heading, Input, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
import FormField from '../../components/FormField';
import GenderRadio from '../../components/GenderRadio';
// フリガナ・健保・住所・既往歴・連絡事項の入力欄をまとめた部品
import PatientDetailFields from '../../components/PatientDetailFields';
import { fetchPatient, updatePatient } from '../../api/patients';
import type { LastVisit, Patient } from '../../types/management';
import type { PatientFormValues } from '../../types/type';
import dayjs from 'dayjs';
import { yupResolver } from '@hookform/resolvers/yup';
import { patientSchema } from './schema';

const VISIT_DATE_FORMAT = 'YYYY年MM月DD日';
// 前回受診日の表示
const getLastVisitText = (lastVisit?: LastVisit) => {
  switch (lastVisit?.status) {
    // 受診歴あり。最新の受診日を表示
    case 'complete':
      return `前回受診日：${dayjs(lastVisit.date).format(VISIT_DATE_FORMAT)}`;
    // 予約まで済んだが、キャンセルで未受診の場合
    case 'cancel':
      return `前回受診日：${dayjs(lastVisit.date).format(VISIT_DATE_FORMAT)}キャンセルで未受診`;
    // 予約中（受診前・受診中の予約しかない）
    case 'reserved':
      return '前回受診日：未受診';
    // 初診の場合
    case 'firstVisit':
      return '前回受診日：初診';
    // 前回受診の情報がないときは表示しない
    default:
      return null;
  }
};

// フォームの初期値
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

// 患者情報編集画面のコンポーネント
const PatientEdit = () => {
  const navigate = useNavigate();
  // URLの /patients/:id/edit から患者IDを取り出す
  const { id = '' } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 取得した前回受診
  const [lastVisit, setLastVisit] = useState<LastVisit | undefined>(undefined);
  // 「前回受診日：…」の文言（前回受診の情報がないときは null で表示しない）
  const lastVisitText = getLastVisitText(lastVisit);
  // useForm からフォームで使う道具を取り出す
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(patientSchema),
  });
  useEffect(() => {
    const loadPatient = async () => {
      try {
        const { id: _id, lastVisit: fetchedLastVisit, ...patientData } = await fetchPatient(id);
        setLastVisit(fetchedLastVisit);
        // 登録されている情報を入れる（初診でも入れる。空にすると保存時に登録済みの情報が消えるため）
        reset({ ...DEFAULT_VALUES, ...patientData });
      } catch {
        setLoadErrorMessage('患者データの取得に失敗しました');
      } finally {
        // 読み込み終了（くるくるを消してフォームを表示する）
        setIsLoading(false);
      }
    };
    loadPatient();
  }, [id, reset]);
  // 患者詳細画面に戻る
  const goToDetail = () => navigate(`/patients/${id}`);
  const onSubmit = async (values: PatientFormValues) => {
    // 前に出ていたエラーメッセージを消す
    setErrorMessage(null);
    try {
      await updatePatient(id, { ...values, gender: values.gender as Patient['gender'], lastVisit });
      goToDetail();
    } catch {
      setErrorMessage('患者情報の更新に失敗しました');
    }
  };
  // 読み込み中・取得エラー・フォームのどれを出すかを決める
  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }
    // 取得に失敗したときはフォームを出さない
    if (loadErrorMessage) {
      return (
        <Text fontSize="body" color="#c62828">
          {loadErrorMessage}
        </Text>
      );
    }
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 基本情報（生年月日・氏名・性別） */}
        <Box bg="#fff" p="32px" mb="32px">
          <Heading as="h2" fontSize="h2" fontWeight="bold" mb="24px">
            基本情報
          </Heading>
          <SimpleGrid columns={3} gap="40px">
            <FormField label="生年月日" isRequired errorMessage={errors.birthDate?.message}>
              {/* 日付を選べる入力欄 */}
              <Input type="date" {...register('birthDate')} />
            </FormField>
            {/* 氏名 */}
            <FormField label="氏名" isRequired errorMessage={errors.name?.message}>
              <Input placeholder="山田太郎" {...register('name')} />
            </FormField>
            {/* 性別 */}
            <FormField label="性別" isRequired errorMessage={errors.gender?.message}>
              <Controller
                // フォームのどの項目か
                name="gender"
                // useForm から取り出した control を渡して、フォームとつなぐ
                control={control}
                // render: 実際に表示する部品を返す
                render={({ field }) => (
                  <GenderRadio value={field.value} onChange={field.onChange} />
                )}
              />
            </FormField>
          </SimpleGrid>
        </Box>
        {/* 患者情報（フリガナ・健保・住所・既往歴・連絡事項） */}
        <Box bg="#fff" p="32px" mb="32px">
          <PatientDetailFields register={register} errors={errors} />
          {/* 登録情報の下に前回受診日を表示する */}
          {lastVisitText && (
            <Text fontSize="body" fontWeight="bold" mt="24px">
              {lastVisitText}
            </Text>
          )}
        </Box>
        {errorMessage && (
          <Text fontSize="body" color="#c62828" textAlign="center" mb="16px">
            {errorMessage}
          </Text>
        )}
        {/* 保存ボタン */}
        <Flex justify="center">
          <AppButton size="large" type="submit" text={isSubmitting ? '保存中…' : '保存する'} />
        </Flex>
      </form>
    );
  };
  return (
    <TemplatePage>
      <Flex justify="space-between" align="flex-start" mb="32px">
        <Box>
          <Heading as="h1" fontSize="h1" fontWeight="bold" mb="16px">
            患者情報編集
          </Heading>
          <Text fontSize="text">
            {/* as="span": 文の途中の一部分だけ色を変えるため、span（インライン要素）にする */}
            <Text as="span" color="#c62828">
              必須
            </Text>
            の項目は必ず入力してください
          </Text>
        </Box>
        <AppButton variant="outline" text="編集キャンセル" onClick={goToDetail} />
      </Flex>
      {renderContent()}
    </TemplatePage>
  );
};

export default PatientEdit;
