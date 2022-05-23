import React from 'react';
import {useTranslation} from 'react-i18next';
import {ACCOUNT_LINKS} from '../AccountSections';
import TemplatesList from './TemplatesList';
import {NewTemplateButton, RouterLink, Wrapper} from './styled';

type CustomContractsListProps = {housingId?: string; className?: string};
function CustomContractsList({housingId, className}: CustomContractsListProps) {
  const {t} = useTranslation();

  return (
    <Wrapper className={className}>
      <TemplatesList housingId={housingId} />
      <RouterLink to={ACCOUNT_LINKS.newCustomContract}>
        <NewTemplateButton label={t('create_contract_template')} />
      </RouterLink>
    </Wrapper>
  );
}

export {CustomContractsList};
