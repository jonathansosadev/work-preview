import React from 'react';
import {useTranslation} from 'react-i18next';
import Section from '../../Section';
import CustomContractsList from '../../CustomContractsList';
import {Title, Container} from './styled';

function CustomContractsSection() {
  const {t} = useTranslation();

  return (
    <>
      <Section
        title={t('custom_contracts')}
        subtitle={t('custom_contracts_section_subtitle')}
      >
        <Container>
          <Title>{t('my_templates')}</Title>
          <CustomContractsList />
        </Container>
      </Section>
    </>
  );
}

export {CustomContractsSection};
