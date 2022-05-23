import React from 'react';
import {components, ActionMeta} from 'react-select';
import {SelectProps} from '../Select/Select';
import removeIcon from '../../../assets/remove.svg';
import {SelectOption} from '../../../utils/types';
import {RemoveIcon, StyledSelect, ClearIndicatorContainer} from './styled';

const MultiValueRemove = (props: any) => {
  return (
    <components.MultiValueRemove {...props}>
      <RemoveIcon src={removeIcon} alt="Remove" />
    </components.MultiValueRemove>
  );
};

const ClearIndicator = (props: any) => {
  return (
    <ClearIndicatorContainer {...props}>
      <RemoveIcon src={removeIcon} alt="Clear" />
    </ClearIndicatorContainer>
  );
};

type MultiSelectProps = Omit<SelectProps, 'onChange'> & {
  onChange?: <Option extends SelectOption>(
    option: Option[],
    info: ActionMeta<Option>,
  ) => void;
  empty?: boolean;
};

function MultiSelect({onChange, empty, ...props}: MultiSelectProps) {
  const handleChange = onChange as any;
  const isEmpty = Boolean(empty || !props?.value?.length);

  return (
    <StyledSelect
      isMulti
      components={{MultiValueRemove, ClearIndicator}}
      onChange={handleChange}
      empty={isEmpty}
      {...props}
    />
  );
}

export {MultiSelect};
