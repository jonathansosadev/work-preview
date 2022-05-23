import React from 'react';
import {useParams} from 'react-router-dom';
import {useQuery} from 'react-query';
import Loader from '../../../common/Loader';
import api from '../../../../api';
import {
  CustomEmailsPayload,
  FORM_NAMES,
  CustomEmail,
  LANGUAGES_WITH_ALL_LANGUAGES,
} from '../CustomEmail';

type CustomEmailData = CustomEmailsPayload & {id: string};

function EditCustomEmail() {
  const {id: customEmailId} = useParams<{id: string}>();
  const {data: customEmail} = useQuery<CustomEmailData>(
    ['customEmailItem', customEmailId],
    () => api.customEmails.fetchCustomEmail(customEmailId),
    {
      enabled: Boolean(customEmailId),
    },
  );

  const preloadedLanguage = LANGUAGES_WITH_ALL_LANGUAGES.find(
    ({value}) => value === customEmail?.language,
  );

  const defaultValues = {
    [FORM_NAMES.name]: customEmail?.name,
    [FORM_NAMES.subject]: customEmail?.subject,
    [FORM_NAMES.text_format]: customEmail?.text_format,
    [FORM_NAMES.html_format]: customEmail?.html_format,
    [FORM_NAMES.email_language]: preloadedLanguage,
  };

  return !customEmail ? (
    <Loader height={40} width={40} />
  ) : (
    <CustomEmail
      title={customEmail.name}
      submitAction={(payload: CustomEmailsPayload) =>
        api.customEmails.updateCustomEmails(customEmail.id, payload)
      }
      timingOptionSource={customEmail.sending_settings}
      checkboxesSource={customEmail.housings}
      defaultFormValues={defaultValues}
    />
  );
}

export {EditCustomEmail};
