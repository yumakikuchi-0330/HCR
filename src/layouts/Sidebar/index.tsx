import { Box, HStack, Icon, Link, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
// Lucideアイコン、画面を切り替えるリンクになる
import { LuHouse, LuSearch } from 'react-icons/lu';
import type { IconType } from 'react-icons';

// メニュー項目
type MenuItem = {
  label: string;
  to: string;
  icon: IconType;
};
const MENU_ITEMS: MenuItem[] = [
  { label: 'ホーム', to: '/', icon: LuHouse },
  { label: '患者検索', to: '/patients', icon: LuSearch },
];

export const Sidebar = () => {
  return (
    <Box
      as="aside"
      w="200px"
      minH="100vh"
      backgroundColor="#fff"
      borderRight="1px solid #D9D9D9"
      // 縦幅
      pt="60px"
      // 横幅
      px="20px"
    >
      {/* VStack縦方向、navタグ */}
      <VStack as="nav" gap="24px">
        {/* 1回目はホーム、2回目は患者検索 */}
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.to}
            asChild
            color="#202f55"
            borderRadius="6px"
            _hover={{ textDecoration: 'none', backgroundColor: 'blue.50' }}
          >
            <NavLink to={item.to} end>
              {/* HStack横方向 */}
              <HStack gap="10px">
                <Icon as={item.icon} boxSize="14px" />
                <Text fontSize="14px" fontWeight="bold">
                  {item.label}
                </Text>
              </HStack>
            </NavLink>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;