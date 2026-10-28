import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  DatePicker,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  parseDate,
} from '@chakra-ui/react';
import TemplatePage from '../../layouts/TemplatePage';
import StatusBadge from '../../components/StatusBadge';
// ChakraのButtonと名前が被るため別名で読み込む
import AppButton from '../../components/Button';
import { fetchReservationsDate } from '../../api/reservations';
import { fetchPatients } from '../../api/patients';
import { COURSES } from '../../types/type';
import type { CourseId } from '../../types/type';
import type { Patient, Reservation } from '../../types/management';
import { formatLongDate, formatShortDate, getToday } from '../../utils/date';

type Status = Reservation['status'];
// ステータスの表示名
const STATUS_LABELS: Record<Status, string> = {
  before: '受診前',
  inProgress: '受診中',
  complete: '受診済',
  cancel: 'キャンセル',
};
// 表示するステータスの並び順（STATUS_LABELSの定義順）
const STATUS_LIST = Object.keys(STATUS_LABELS) as Status[];
const PAGE_SIZE = 5; // 1ページに出す件数
const FIRST_PAGE = 1;
const NO_OPTION = '—';
// コースIDからコースを探す。見つからない場合は空文字
const getCourseName = (courseId: CourseId) =>
  COURSES.find((course) => course.courseId === courseId)?.courseName ?? '';
// オプション名を表示（なければ「—」）
const getOptionNames = (reservation: Reservation) => {
  if (reservation.options.length === 0) {
    return NO_OPTION;
  }
  return reservation.options.map((option) => option.optionName).join('・');
};

const Home = () => {
  // 画面を移動する関数
  const navigate = useNavigate();
  // 日付のstate
  const [selectedDate, setSelectedDate] = useState(getToday());
  // 予約の一覧のstate
  const [reservations, setReservations] = useState<Reservation[]>([]);
  // 患者の一覧のstate
  const [patients, setPatients] = useState<Patient[]>([]);
  // 現在のページ数のstate
  const [page, setPage] = useState(FIRST_PAGE);
  // ローディング
  const [isLoading, setIsLoading] = useState(true);
  // エラーメッセージの描画
  const [error, setError] = useState<string | null>(null);
  // 選んだ日付が変わるたびに、その日の予約を取り直す
  useEffect(() => {
    const loadReservations = async () => {
      setIsLoading(true);
      setError(null);
      setPage(FIRST_PAGE);
      try {
        // 予約データと患者データを同時に取得（Promise.all）
        const [reservationData, patientData] = await Promise.all([
          fetchReservationsDate(selectedDate),
          fetchPatients(),
        ]);
        setReservations([...reservationData].sort((a, b) => a.time.localeCompare(b.time)));
        setPatients(patientData);
      } catch {
        setError('予約データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    loadReservations();
  }, [selectedDate]);
  const findPatientById = (patientId: string) =>
    patients.find((patient) => patient.id === patientId);
  // ステータスごとの件数
  const countByStatus = (status: Status) =>
    reservations.filter((reservation) => reservation.status === status).length;
  // ページ分け
  const totalPages = Math.max(FIRST_PAGE, Math.ceil(reservations.length / PAGE_SIZE));
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + FIRST_PAGE);
  const startIndex = (page - FIRST_PAGE) * PAGE_SIZE;
  const pageReservations = reservations.slice(startIndex, startIndex + PAGE_SIZE);
  const renderTable = () => {
    // 読み込み中くるくる
    if (isLoading) {
      return <Spinner />;
    }
    // エラーは赤い文字で表示
    if (error) {
      return <Text fontSize="body" color="red">{error}</Text>;
    }
    // 予約が0件の場合、text出現
    if (reservations.length === 0) {
      return <Text fontSize="body" color="gray.500">この日の予約はありません</Text>;
    }
    return (
      // 入れ物。表とページボタンを囲む
      <>
        {/* 予約一覧の表 */}
        <Table.Root fontSize="body">
          {/* 表の見出し行 */}
          <Table.Header>
            <Table.Row bg="#F5F7FB">
              <Table.ColumnHeader>日付</Table.ColumnHeader>
              <Table.ColumnHeader>時間</Table.ColumnHeader>
              <Table.ColumnHeader>患者名</Table.ColumnHeader>
              <Table.ColumnHeader>コース</Table.ColumnHeader>
              <Table.ColumnHeader>オプション</Table.ColumnHeader>
              <Table.ColumnHeader>ステータス</Table.ColumnHeader>
              <Table.ColumnHeader />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {/* 今のページの予約を1件ずつ処理 */}
            {pageReservations.map((reservation) => {
              const patient = findPatientById(reservation.patientId);
              return (
                <Table.Row key={reservation.id}>
                  {/* 予約日と時間 */}
                  <Table.Cell fontWeight="bold">{formatShortDate(reservation.date)}</Table.Cell>
                  <Table.Cell fontWeight="bold">{reservation.time}</Table.Cell>
                  {/* 患者名とその下にふりがな */}
                  <Table.Cell>
                    <Text fontWeight="bold">{patient?.name ?? '不明'}</Text>
                    <Text fontSize="text" color="gray.500">
                      {patient?.nameKana}
                    </Text>
                  </Table.Cell>
                  {/* コース名 */}
                  <Table.Cell fontWeight="bold">{getCourseName(reservation.courseId)}</Table.Cell>
                  <Table.Cell fontSize="body" color="gray.600">
                    {/* オプション */}
                    {getOptionNames(reservation)}
                  </Table.Cell>
                  <Table.Cell>
                    {/* ステータスバッジ */}
                    <StatusBadge
                      label={STATUS_LABELS[reservation.status]}
                      situation={reservation.status}
                    />
                  </Table.Cell>
                  {/* 患者詳細ボタン */}
                  <Table.Cell>
                    <Button
                      size="xs"
                      variant="outline"
                      colorPalette="blue"
                      onClick={() => navigate(`/reservations/${reservation.id}`)}
                    >
                      詳細
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
        {/* ページネーション */}
        <HStack justify="flex-end" mt="24px" gap="12px">
          <Button
            variant="outline"
            disabled={page === FIRST_PAGE}
            onClick={() => setPage(page - 1)}
          >
            {/* 「<」 */}
            &lt;
          </Button>
          {/* ページ番号 */}
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === page ? 'solid' : 'outline'}
              colorPalette="blue"
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            {/* 「>」 */}
            &gt;
          </Button>
        </HStack>
      </>
    );
  };
  return (
    // ヘッダーサイドバー付きのテンプレートで囲む
    <TemplatePage>
      <Heading as="h2" fontSize="h2" fontWeight="bold" mb="16px" color="#202f55">
        予約一覧
      </Heading>
      {/* カレンダー・日付と新規予約ボタンの行 */}
      <Flex justify="space-between" align="center" mb="24px">
        {/* カレンダーと選択中の日付を横並び */}
        <HStack gap="20px">
          {/* カレンダー */}
          <DatePicker.Root
            inline
            locale="ja-JP"
            value={[parseDate(selectedDate)]}
            onValueChange={(details) => {
              const date = details.value[0];
              if (date) {
                setSelectedDate(date.toString());
              }
            }}
          >
            <DatePicker.View view="day">
              <DatePicker.Header />
              <DatePicker.DayTable />
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Header />
              <DatePicker.MonthTable />
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Header />
              <DatePicker.YearTable />
            </DatePicker.View>
          </DatePicker.Root>
          {/* 日付は折り返さず1行で表示 */}
          <Text fontSize="text" whiteSpace="nowrap" flexShrink={0}>
            {formatLongDate(selectedDate)}
          </Text>
        </HStack>
        {/* 新規予約ボタン */}
        <AppButton size="medium" text="新規予約" onClick={() => navigate('/reservations/new')} />
      </Flex>
      <SimpleGrid columns={STATUS_LIST.length} gap="16px" mb="24px">
        {STATUS_LIST.map((status) => (
          <Flex key={status} bg="#fff" p="16px" justify="space-between" align="center">
            <StatusBadge label={STATUS_LABELS[status]} situation={status} />
            <Text fontSize="body">
              <Text as="span" fontSize="h2" fontWeight="bold">
                {countByStatus(status)}
              </Text>
              件
            </Text>
          </Flex>
        ))}
      </SimpleGrid>
      <Box bg="#fff" p="40px">
        {renderTable()}
      </Box>
    </TemplatePage>
  );
};
export default Home;
