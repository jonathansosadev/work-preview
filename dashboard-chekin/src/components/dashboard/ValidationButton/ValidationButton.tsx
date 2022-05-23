import React from 'react';
import checkIcon from '../../../assets/check.svg';
import checkProcessingIcon from '../../../assets/check-processing.svg';
import checkFilledIcon from '../../../assets/check-filled.svg';
import {Button} from './styled';
import {VALIDATION_STATUSES} from '../../../utils/constants';
import {useTranslation} from 'react-i18next';

type ValidationButtonProps = {
  status?: string;
  errorMessage?: string;
  [key: string]: any;
};

const defaultProps: ValidationButtonProps = {
  status: '',
  errorMessage: '',
};

function ValidationButton({status, errorMessage, ...props}: ValidationButtonProps) {
  const {t} = useTranslation();

  const getStateLabel = () => {
    if (status === VALIDATION_STATUSES.inProgress) {
      return (
        <>
          <img src={checkProcessingIcon} alt="Check mark" />
          {t('validating')}...
        </>
      );
    }

    if (status === VALIDATION_STATUSES.complete) {
      return (
        <>
          <img src={checkFilledIcon} alt="Check mark" />
          {t('completed')}
        </>
      );
    }

    if (status === VALIDATION_STATUSES.error) {
      return errorMessage || t('error');
    }

    return (
      <>
        <img src={checkIcon} alt="Check mark" />
        {t('validate')}
      </>
    );
  };

  return <Button secondary label={getStateLabel()} status={status} {...props} />;
}

ValidationButton.defaultProps = defaultProps;
export {ValidationButton};
