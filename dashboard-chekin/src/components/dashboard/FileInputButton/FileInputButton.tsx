import React, {InputHTMLAttributes} from 'react';
import uploadIcon from '../../../assets/icon-upload.svg';
import {
  FileInputLabel,
  HiddenFileUploader,
  FileUploadIcon,
  FileInputText,
} from './styled';

export type FileInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
  secondary?: boolean;
  danger?: boolean;
};

const defaultProps: FileInputProps = {
  label: '',
  accept: '',
  secondary: false,
  danger: false,
  type: 'file',
  icon: <FileUploadIcon src={uploadIcon} alt="" />,
};

const FileInputButton = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({label, disabled, icon, secondary, className, danger, ...props}, ref) => {
    return (
      <FileInputLabel
        className={className}
        disabled={disabled}
        secondary={secondary}
        danger={danger}
      >
        <HiddenFileUploader ref={ref} disabled={disabled} type="file" {...props} />
        {icon}
        <FileInputText>{label}</FileInputText>
      </FileInputLabel>
    );
  },
);

FileInputButton.defaultProps = defaultProps;
export {FileInputButton};
