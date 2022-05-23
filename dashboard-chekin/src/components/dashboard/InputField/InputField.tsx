import React from 'react';
import {useFormContext, RegisterOptions} from 'react-hook-form';
import {getRequiredOrOptionalFieldLabel} from '../../../utils/common';
import {StyledInput} from './styled';

type InputFieldProps = {
  className?: string;
  name: string;
  label: string;
  placeholder: string;
  disabled: boolean;
  fields: any;
  registerConfig?: RegisterOptions;
};

function InputField({
  className,
  name,
  label,
  placeholder,
  disabled,
  fields,
  registerConfig,
}: InputFieldProps) {
  const {
    register,

    formState: {
      errors,
    },
  } = useFormContext();
  const defaultRegisterConfig = {
    required: fields.required[name],
  };

  return (
    <StyledInput
      className={className}
      {...register(name, registerConfig ? registerConfig : defaultRegisterConfig)}
      label={getRequiredOrOptionalFieldLabel(label, fields.required[name])}
      placeholder={placeholder}
      error={errors[name]?.message}
      disabled={disabled}
    />
  );
}

export {InputField};
