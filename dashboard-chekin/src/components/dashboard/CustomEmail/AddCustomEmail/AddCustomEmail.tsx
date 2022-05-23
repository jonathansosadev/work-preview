import React from 'react';
import api, {ResolverTypes} from '../../../../api';
import {useTranslation} from 'react-i18next';
import {
  CustomEmailsPayload,
  CustomEmail,
  FORM_NAMES,
  LANGUAGES_WITH_ALL_LANGUAGES,
} from '../CustomEmail';

function AddCustomEmail() {
  const {t} = useTranslation();

  const defaultFormValues = {
    [FORM_NAMES.name]: '',
    [FORM_NAMES.subject]: '',
    [FORM_NAMES.text_format]: '',
    [FORM_NAMES.email_language]: LANGUAGES_WITH_ALL_LANGUAGES[0],
  };

  const submit = (payload: CustomEmailsPayload): Promise<ResolverTypes> => {
    return api.customEmails.createCustomEmails(payload);
  };

  return (
    <CustomEmail
      title={t('new_template')}
      submitAction={submit}
      defaultFormValues={defaultFormValues}
    />
  );
}

export {AddCustomEmail};
