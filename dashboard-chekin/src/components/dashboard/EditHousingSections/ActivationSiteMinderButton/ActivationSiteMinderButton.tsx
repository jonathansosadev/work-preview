import React from 'react';
import {useTranslation} from 'react-i18next';
import {downloadFromLink} from '../../../../utils/common';
import surfaceIcon from '../../../../assets/surface.svg';
import {ButtonLabel, ButtonStyled} from './styled';
import {ButtonProps} from '../../Button/Button';

const siteMinderLink = 'https://activation.siteminder.services/';

type ActivationRequestButtonProps = Partial<ButtonProps> & {
  callback?: () => void;
};
function ActivationSiteMinderButton({callback, ...props}: ActivationRequestButtonProps) {
  const {t} = useTranslation();

  const handleClickActivation = () => {
    if (callback) callback();
    downloadFromLink(siteMinderLink);
  };

  return (
    <ButtonStyled
      link
      {...props}
      label={
        <ButtonLabel>
          {t('activation_request')}
          <img width={10} height={20} src={surfaceIcon} alt="" />
        </ButtonLabel>
      }
      onClick={handleClickActivation}
    />
  );
}

export {ActivationSiteMinderButton};
