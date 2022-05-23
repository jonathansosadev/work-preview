import React from 'react';
import {Status} from '../../../utils/types';
import {useTranslation} from 'react-i18next';
import saveIcon from '../../../assets/floppy-disk.svg';
import {
  FloatingButton,
  ButtonLabelWrapper,
  ButtonLabelIcon,
  ButtonLabelText,
} from './styled';

type FloatingSaveButtonProps = {
  status: Status;
  type?: 'submit' | 'button';
  onClick?: () => any;
};

const defaultProps: FloatingSaveButtonProps = {
  status: 'idle',
  type: 'submit',
  onClick: () => {},
};

function FloatingSaveButton({status, type, onClick}: FloatingSaveButtonProps) {
  const {t} = useTranslation();

  return (
    <FloatingButton
      type={type}
      disabled={status !== 'idle'}
      status={status}
      onClick={onClick}
      label={
        <ButtonLabelWrapper>
          {status === 'loading' && <ButtonLabelText>{t('saving')}...</ButtonLabelText>}
          {status === 'error' && <ButtonLabelText>{t('error')}</ButtonLabelText>}
          {status === 'success' && (
            <ButtonLabelText>{t('saved_exclamation')}</ButtonLabelText>
          )}
          {status === 'idle' && (
            <>
              <ButtonLabelIcon src={saveIcon} alt="Plus" />
              <ButtonLabelText>{t('save_changes')}</ButtonLabelText>
            </>
          )}
        </ButtonLabelWrapper>
      }
    />
  );
}

FloatingSaveButton.defaultProps = defaultProps;
export {FloatingSaveButton};
