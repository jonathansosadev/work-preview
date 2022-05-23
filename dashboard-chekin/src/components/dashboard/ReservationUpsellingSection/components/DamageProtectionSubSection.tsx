import React from 'react';
import {useTranslation} from 'react-i18next';
import surfaceIcon from '../../../../assets/surface-white.svg';
import Loader from '../../../common/Loader';
import {
  DamageNoticeButton,
  HorizontalLine,
  LoaderWrapper,
  TitleBlock,
  UpsellingDamageProtectionSubSection,
} from '../styled';

const submitDamageNoticeLink = 'https://waivo.io/damage-notice/';

type DamageProtectionSubSectionProps = {
  isLoading?: boolean;
};
function DamageProtectionSubSection({isLoading}: DamageProtectionSubSectionProps) {
  const {t} = useTranslation();

  const handleClickNoticeButton = () => {
    window.open(submitDamageNoticeLink, '_blank');
  };

  if (isLoading) {
    return (
      <>
        <HorizontalLine />
        <LoaderWrapper>
          <Loader color="#EEEEEE" height={45} width={45} />
        </LoaderWrapper>
      </>
    );
  }

  return (
    <div>
      <HorizontalLine />
      <UpsellingDamageProtectionSubSection
        title={<TitleBlock>{t('damage_protection')}</TitleBlock>}
        subtitle={t('damage_protection_upselling_section_subtitle')}
      >
        <DamageNoticeButton
          label={t('submit_damage_notice_button_label')}
          rightIcon={<img width={12} src={surfaceIcon} alt="" />}
          onClick={handleClickNoticeButton}
        />
      </UpsellingDamageProtectionSubSection>
    </div>
  );
}

export {DamageProtectionSubSection};
