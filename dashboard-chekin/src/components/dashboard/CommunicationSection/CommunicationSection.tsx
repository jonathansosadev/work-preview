import React from 'react';
import {useTranslation} from 'react-i18next';
import {ACCOUNT_LINKS} from '../AccountSections';
import Section from '../Section';
import {TemplatesList} from '.';
// import {BlueSmallLink} from '../../../styled/common';
import {HeaderWrapper, Container, Title, NewTemplateButton, RouterLink} from './styled';

function CommunicationSection() {
  const {t} = useTranslation();

  return (
    <>
      <Section
        title={
          <HeaderWrapper>
            {t('email_templates')}
            {/* <BlueSmallLink>{t('how_it_works')}</BlueSmallLink> */}
          </HeaderWrapper>
        }
        subtitle={t('create_the_emails_templates')}
      >
        <Container>
          <Title>{t('my_templates')}</Title>
          <TemplatesList />
          <RouterLink to={ACCOUNT_LINKS.newCustomEmail}>
            <NewTemplateButton label={t('create_new_template')} />
          </RouterLink>
        </Container>
      </Section>
    </>
  );
}

export {CommunicationSection};
