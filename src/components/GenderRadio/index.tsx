import { Flex, RadioGroup } from '@chakra-ui/react';
import type { Patient } from '../../types/management';

const GENDERS: Patient['gender'][] = ['男性', '女性'];

type GenderRadioProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

// 性別の選択（男性・女性）
export const GenderRadio = ({ value, onChange, disabled = false }: GenderRadioProps) => (
  <RadioGroup.Root
    value={value}
    onValueChange={(details) => onChange(details.value ?? '')}
    disabled={disabled}
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
);

export default GenderRadio;
