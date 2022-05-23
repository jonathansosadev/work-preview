import React from 'react';
import i18n from '../../i18n';
import removeIcon from '../../assets/remove.svg';
import paperClipIcon from '../../assets/paper-clip.svg';
import {ErrorMessage} from '../../styled/common';
import {Label} from '../Input/styled';
import {
  FileInputLabel,
  HiddenFileUploader,
  FileInputBox,
  ClipContainer,
  FileName,
  FileNameContainer,
  ClearIcon,
  ClearButton,
  Placeholder,
} from './styled';

export type FileInputProps = {
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  label?: string;
  value?: File | string;
  placeholder?: string;
  accept?: string;
  disabled?: boolean;
  multiple?: boolean;
  invalid?: boolean;
  className?: string;
  error?: any;
};

const defaultProps: Partial<FileInputProps> = {
  onChange: () => {},
  label: '',
  error: '',
  invalid: false,
  placeholder: i18n.t('attach_document'),
  accept: '',
  disabled: false,
  className: undefined,
  multiple: false,
};

function FileInput({
  onChange,
  label,
  accept,
  disabled,
  className,
  multiple,
  placeholder,
  value,
  error,
  invalid,
}: FileInputProps) {
  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  return (
    <FileInputLabel
      invalid={invalid || Boolean(error)}
      className={className}
      disabled={disabled}
    >
      <HiddenFileUploader
        multiple={multiple}
        disabled={disabled}
        type="file"
        name="fileInput"
        accept={accept}
        onChange={onChange}
      />
      <Label>{label}</Label>
      <FileInputBox>
        {value instanceof File && (
          <FileNameContainer onClick={e => e.preventDefault()}>
            <FileName>{value.name}</FileName>
            <ClearButton disabled={disabled} onClick={handleClear}>
              <ClearIcon src={removeIcon} alt="Remove" />
            </ClearButton>
          </FileNameContainer>
        )}
        {!value && <Placeholder>{placeholder}</Placeholder>}
        <ClipContainer>
          <img src={paperClipIcon} alt="Attach file" />
        </ClipContainer>
      </FileInputBox>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FileInputLabel>
  );
}

FileInput.defaultProps = defaultProps;
export {FileInput};
