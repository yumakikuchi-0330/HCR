import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MemoryRouter } from 'react-router-dom';
import { TemplatePage } from '.';

const meta = {
  title: 'Layouts/TemplatePage',
  component: TemplatePage,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    children: <p>テスト</p>,
  },
} satisfies Meta<typeof TemplatePage>;

export default meta;
export type Story = StoryObj<typeof meta>;
export const Default: Story = {};