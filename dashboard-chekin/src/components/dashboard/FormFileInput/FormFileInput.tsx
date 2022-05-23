import React from 'react';
import i18n from '../../../i18n';
import {useTranslation} from 'react-i18next';
import {downloadFromLink} from '../../../utils/common';
import removeIcon from '../../../assets/remove.svg';
import paperClipIcon from '../../../assets/paper-clip.svg';
import downloadIcon from '../../../assets/direct-download.svg';
import {ErrorMessage} from '../../../styled/common';
import {Name} from '../Input/styled';
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
  DownloadButton,
  DownloadIcon,
} from './styled';

export type FormFileInputProps = {
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  label?: string;
  value?: File | string;
  placeholder?: string;
  accept?: string;
  disabled?: boolean;
  multiple?: boolean;
  invalid?: boolean;
  className?: string;
  error?: Error | string;
};

const defaultProps: Partial<FormFileInputProps> = {
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

function FormFileInput({
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
}: FormFileInputProps) {
  const {t} = useTranslation();
  const isDownloadable = typeof value === 'string' && value.startsWith('https://');

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  const downloadFile = () => {
    downloadFromLink(value as string);
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
      <Name>{label}</Name>
      <FileInputBox>
        {isDownloadable && (
          <FileNameContainer onClick={(e) => e.preventDefault()}>
            <DownloadButton onClick={downloadFile}>
              {t('download_attachment')}
              <DownloadIcon src={downloadIcon} alt="Download file" />
            </DownloadButton>
            <ClearButton disabled={disabled} onClick={handleClear}>
              <ClearIcon src={removeIcon} alt="Remove" />
            </ClearButton>
          </FileNameContainer>
        )}
        {value instanceof File && (
          <FileNameContainer onClick={(e) => e.preventDefault()}>
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

FormFileInput.defaultProps = defaultProps;
export {FormFileInput};
