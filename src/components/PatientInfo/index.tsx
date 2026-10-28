import { Box, Grid, Text } from '@chakra-ui/react';
import type { Patient } from '../../types/management';

type PatientInfoProps = {
  patient: Patient;
};

const NO_VALUE = '—';

// 登録済みの患者情報を表示する（編集不可）
export const PatientInfo = ({ patient }: PatientInfoProps) => {
  // 表示する項目（未登録の項目は「—」）
  const items = [
    { label: 'フリガナ', value: patient.nameKana },
    { label: '性別', value: patient.gender },
    { label: '健保', value: patient.insurance },
    { label: '住所', value: patient.address },
    { label: '既往歴', value: patient.medicalHistory },
  ];

  return (
    <Box>
      <Grid templateColumns="160px 1fr" rowGap="16px" mb="32px">
        {items.map((item) => (
          <Box key={item.label} display="contents">
            <Text fontSize="label" fontWeight="bold" color="#202f55">
              {item.label}
            </Text>
            <Text fontSize="body">{item.value || NO_VALUE}</Text>
          </Box>
        ))}
      </Grid>
      {/* 連絡事項は目立つように帯で表示 */}
      {patient.note && (
        <Box bg="#fce4d0" px="56px" py="16px">
          <Text fontSize="body" fontWeight="bold" color="#e8862f">
            連絡事項：{patient.note}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default PatientInfo;
