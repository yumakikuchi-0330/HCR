import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import TemplatePage from '../../layouts/TemplatePage';
import AppButton from '../../components/Button';
// 登録済みの患者情報を表示する部品（患者新規登録画面と同じものを使う）
import PatientInfo from '../../components/PatientInfo';
// fetchPatient: 患者を1人分取得するAPI
import { fetchPatient } from '../../api/patients';
import type { Patient } from '../../types/management';

const PatientDetail = () => {
  const navigate = useNavigate();
  // URLの /patients/:id から患者IDを取り出す
  const { id = '' } = useParams<{ id: string }>();
  // 取得した患者データ（取得前・取得失敗のときは null）
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    const loadPatient = async () => {
      try {
        setPatient(await fetchPatient(id));
      } catch {
        setErrorMessage('患者データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    loadPatient();
  }, [id]);
  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }
    if (errorMessage || !patient) {
      return (
        <Text fontSize="body" color="#c62828">
          {errorMessage}
        </Text>
      );
    }
    return (
      <Box bg="#fff" p="32px">
        <Heading as="h2" fontSize="h2" fontWeight="bold" mb="8px">
          {patient.name}
        </Heading>
        <Text fontSize="body" color="#5b6680" mb="24px">
          生年月日：{patient.birthDate}
        </Text>
        <PatientInfo patient={patient} />
      </Box>
    );
  };
  return (
    <TemplatePage>
      {/* タイトルとボタン */}
      <Flex justify="space-between" align="flex-start" mb="32px">
        <Heading as="h1" fontSize="h1" fontWeight="bold">
          患者詳細
        </Heading>
        <Flex gap="16px">
          {/* ホーム画面に戻る */}
          <AppButton variant="outline" text="戻る" onClick={() => navigate('/')} />
          {/* 患者情報編集画面へ移動する（取得に失敗したときは編集できないので出さない） */}
          {patient && (
            <AppButton text="編集する" onClick={() => navigate(`/patients/${id}/edit`)} />
          )}
        </Flex>
      </Flex>
      {renderContent()}
    </TemplatePage>
  );
};

export default PatientDetail;
