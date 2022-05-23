import React from 'react';
import {useMutation} from 'react-query';
import {useTranslation} from 'react-i18next';
import api from '../../../../api';
import {ErrorDuplicateUsingHousing, FORM_NAMES} from '../constants';
import {useIsMounted} from '../../../../utils/hooks';
import {toastResponseError} from '../../../../utils/common';
import {CustomContract} from '../CustomContract';
import {CustomDocument} from '../../../../utils/types';

function AddCustomContract() {
  const isMounted = useIsMounted();
  const {t} = useTranslation();

  const defaultFormValues = {
    [FORM_NAMES.name]: '',
    [FORM_NAMES.title]: '',
    [FORM_NAMES.country]: '',
    [FORM_NAMES.text_format]: '',
  };

  const {isLoading, mutate: customContractMutation} = useMutation<
    CustomDocument,
    string[],
    Partial<CustomDocument>
  >((payload) => api.documents.createCustomDocument(payload), {
    retry: 1,
    onError: (errors) => {
      const error = errors?.[0] as string;
      if (error.startsWith(ErrorDuplicateUsingHousing) || !isMounted.current) {
        return;
      }
      toastResponseError(error);
    },
  });

  return (
    <CustomContract
      title={t('new_template')}
      submitAction={customContractMutation}
      defaultFormValues={defaultFormValues}
      isLoading={isLoading}
    />
  );
}

export {AddCustomContract};
