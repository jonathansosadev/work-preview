import React from 'react';
import {Content, StyledButton} from './styled';
import {ReactEntity} from '../../../utils/types';
import {useFormContext} from 'react-hook-form';

type SelectorInputType = 'radio' | 'checkbox';

export type SelectorButtonProps = {
  content: ReactEntity;
  name: string;
  onClick?: any;
  active?: boolean;
  className?: string;
  type?: SelectorInputType;
  disabled?: boolean;
  value?: string;
  readOnly?: boolean;
};

const defaultProps: SelectorButtonProps = {
  content: '',
  onClick: () => {},
  active: false,
  className: undefined,
  type: 'checkbox',
  disabled: false,
  name: '',
};

const SelectorButton = ({
  content,
  active,
  onClick,
  className,
  type,
  disabled,
  name,
  value,
  readOnly,
  ...props
}: SelectorButtonProps) => {
  const {register} = useFormContext();

  return (
    <StyledButton
      active={active}
      disabled={disabled}
      onClick={onClick}
      className={`${className ? className : ''} selector-button`}
      {...props}
    >
      <input
        {...register(name)}
        type={type}
        value={value}
        disabled={readOnly || disabled}
        readOnly={readOnly}
      />
      <Content>{content}</Content>
    </StyledButton>
  );
};

SelectorButton.defaultProps = defaultProps;
SelectorButton.displayName = 'SelectorButton';

export {SelectorButton};
