import type { ReactNode } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Header from '../Header';
import Sidebar from '../Sidebar';

type TemplatePageProps = {
  // React で画面に表示できるもの全部を表す型
  children: ReactNode;
};

export const TemplatePage = ({ children }: TemplatePageProps) => {
  return (
    <Box minH="100vh">
      <Header title="HCR" />
      <Flex>
        <Sidebar />
        {/* 各画面のコンテンツ */}
        <Box as="main" flex="1" backgroundColor="#f5f6fa" p="18px">
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default TemplatePage;