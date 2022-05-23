import React from 'react';
import {useTranslation} from 'react-i18next';
import i18n from '../../i18n';
import {useReservation} from '../../context/reservation';
import {getHousingCountryCode} from '../../utils/reservation';
import {COUNTRY_CODES} from '../../utils/constants';
import likeIcon from '../../assets/like.svg';
import whatDocsImage from '../../assets/what-documents-icon.png';
import whatDocsImage2x from '../../assets/what-documents-icon@2x.png';
import Modal from '../Modal';
import {Content, Text, Title, Icon, Button} from './styled';

const TEXTS = {
  [COUNTRY_CODES.austria]: {
    local: i18n.t('austria'),
    localDocs: i18n.t('passport_id'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport'),
  },
  [COUNTRY_CODES.belgium]: {
    local: i18n.t('belgium'),
    localDocs: i18n.t('passport_id'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport'),
  },
  [COUNTRY_CODES.colombia]: {
    local: i18n.t('colombians'),
    localDocs: i18n.t('passport'),
    nonLocal: i18n.t('non_colombians'),
    nonLocalDocs: i18n.t('p_residence_permit_did_foreign_documents'),
  },
  [COUNTRY_CODES.czech]: {
    local: i18n.t('czech'),
    localDocs: i18n.t('passport_id_dr_lic'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport'),
  },
  [COUNTRY_CODES.france]: {
    local: i18n.t('france'),
    localDocs: i18n.t('passport_id'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport'),
  },
  [COUNTRY_CODES.germany]: {
    local: i18n.t('germany'),
    localDocs: i18n.t('passport_id'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport'),
  },
  [COUNTRY_CODES.italy]: {
    local: i18n.t('italy'),
    localDocs: i18n.t('id_cert_doc_p_dr_lic_serv_p'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id_dip_p'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport'),
  },
  [COUNTRY_CODES.netherlands]: {
    local: i18n.t('netherlands'),
    localDocs: i18n.t('passport_id'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport'),
  },
  [COUNTRY_CODES.portugal]: {
    local: i18n.t('portugal'),
    localDocs: i18n.t('passport_id_other'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id_other'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport_other'),
  },
  [COUNTRY_CODES.spain]: {
    local: i18n.t('spain'),
    localDocs: i18n.t('passport_id_dr_lic'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('p_srp_eurp'),
  },
  [COUNTRY_CODES.uae]: {
    local: i18n.t('uae'),
    localDocs: i18n.t('passport_id'),
    nonLocal: i18n.t('non-uae'),
    nonLocalDocs: i18n.t('passport'),
  },
  [COUNTRY_CODES.uk]: {
    local: i18n.t('uk'),
    localDocs: i18n.t('passport_id'),
    europeans: i18n.t('europeans'),
    europeansDocs: i18n.t('passport_id'),
    nonEuropeans: i18n.t('non_europeans'),
    nonEuropeansDocs: i18n.t('passport'),
  },
};

type WhatDocumentsShouldIUseModalProps = {
  open: boolean;
  onClose: () => void;
};

function WhatDocumentsShouldIUseModal({
  open,
  onClose,
}: WhatDocumentsShouldIUseModalProps) {
  const {t} = useTranslation();
  const {data} = useReservation();
  const country = getHousingCountryCode(data);
  const texts = TEXTS[country] || TEXTS[COUNTRY_CODES.spain];

  return (
    <Modal open={open} onClose={onClose}>
      <Content>
        <Icon
          src={whatDocsImage}
          srcSet={`${whatDocsImage} 1x, ${whatDocsImage2x} 2x`}
          alt="Thinking person"
        />
        <Title>{t('the_docs_you_can_use_depend_on_nat')}</Title>
        <Text>
          <div>
            <b>- {texts.local}: </b>
            {texts.localDocs}
          </div>
          <p />
          {texts.nonLocal && (
            <>
              <div>
                <b>- {texts.nonLocal}: </b>
                {texts.nonLocalDocs}
              </div>
              <p />
            </>
          )}
          {texts.europeans && (
            <>
              <div>
                <b>- {texts.europeans}: </b>
                {texts.europeansDocs}
              </div>
              <p />
            </>
          )}
          {texts.nonEuropeans && (
            <>
              <div>
                <b>- {texts.nonEuropeans}: </b>
                {texts.nonEuropeansDocs}
              </div>
              <p />
            </>
          )}
        </Text>
        <Button
          label={t('ok')}
          icon={<img src={likeIcon} alt="Like" />}
          onClick={onClose}
        />
      </Content>
    </Modal>
  );
}

export {WhatDocumentsShouldIUseModal};
