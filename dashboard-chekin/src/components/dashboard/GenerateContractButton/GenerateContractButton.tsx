import React from 'react';
import {useTranslation} from 'react-i18next';
import {CONTRACT_GENERATION_STATUSES} from '../../../hooks/useGenerationContract';
import Button from '../Button';
import {ButtonProps} from '../Button/Button';
import {BtnLabel, BtnText} from './styled';

type GenerateContractButtonProps = Omit<ButtonProps, 'label'> & {
  status: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
};
function GenerateContractButton({
  icon,
  status,
  onClick,
  disabled,
  className,
  ...props
}: GenerateContractButtonProps) {
  const {t} = useTranslation();

  const getGenerationContractStatusText = () => {
    switch (status) {
      case CONTRACT_GENERATION_STATUSES.started:
        return t('starting');
      case CONTRACT_GENERATION_STATUSES.request:
        return `${t('generating')}...`;
      case CONTRACT_GENERATION_STATUSES.finished:
        return `${t('done_exclamation')}...`;
      case CONTRACT_GENERATION_STATUSES.failed:
        return `${t('error')}...`;
      default:
        return null;
    }
  };

  return (
    <Button
      type="button"
      disabled={
        disabled ||
        [
          CONTRACT_GENERATION_STATUSES.request,
          CONTRACT_GENERATION_STATUSES.started,
        ].includes(status)
      }
      blinking={[
        CONTRACT_GENERATION_STATUSES.request,
        CONTRACT_GENERATION_STATUSES.started,
      ].includes(status)}
      onClick={onClick}
      label={
        <BtnLabel>
          {icon}
          <BtnText>{getGenerationContractStatusText() || t('generate_sample')}</BtnText>
        </BtnLabel>
      }
      className={className}
      {...props}
    />
  );
}

export {GenerateContractButton};
