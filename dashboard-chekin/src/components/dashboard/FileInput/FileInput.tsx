import React from 'react';
import i18n from '../../../i18n';
import removeIcon from '../../../assets/remove.svg';
import paperClipIcon from '../../../assets/paper-clip.svg';
import {ErrorMessage} from '../../../styled/common';
import {
  FileInputLabel,
  HiddenFileUploader,
  FileInputText,
  FileInputBox,
  ClipContainer,
  FileName,
  FileNameContainer,
  ClearIcon,
  ClearButton,
  Placeholder,
} from './styled';

export type FileInputProps = {
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | null) => void;
  label?: string;
  value?: File;
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
      onChange(null);
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
      <FileInputText>{label}</FileInputText>
      <FileInputBox>
        {value?.name ? (
          <FileNameContainer onClick={(e) => e.preventDefault()}>
            <FileName>{value.name}</FileName>
            <ClearButton disabled={disabled} onClick={handleClear}>
              <ClearIcon src={removeIcon} alt="Remove" />
            </ClearButton>
          </FileNameContainer>
        ) : (
          <Placeholder>{placeholder}</Placeholder>
        )}
        <ClipContainer>
          <img src={paperClipIcon} alt="Paper clip" />
        </ClipContainer>
      </FileInputBox>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FileInputLabel>
  );
}

FileInput.defaultProps = defaultProps;
export {FileInput};
