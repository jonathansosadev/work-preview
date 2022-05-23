import React from 'react';
import {useTranslation} from 'react-i18next';
import {SelectProps} from '../Select/Select';
import {Wrapper, StyledSelect} from './styled';

function HeadingSelect({
  className,
  isSearchable = false,
  ...props
}: SelectProps & {widthList?: number}) {
  const {t} = useTranslation();

  return (
    <Wrapper className={className}>
      <StyledSelect
        noOptionsMessage={() => t('no_options')}
        isSearchable={isSearchable}
        {...props}
      />
    </Wrapper>
  );
}

export {HeadingSelect};
