import type { Preview } from '@storybook/react-webpack5'
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../src/system';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  // 全ストーリーをChakraProviderで囲む
  decorators: [
    (Story) => (
      <ChakraProvider value={system}>
        <Story />
      </ChakraProvider>
    ),
  ],
};

export default preview;
