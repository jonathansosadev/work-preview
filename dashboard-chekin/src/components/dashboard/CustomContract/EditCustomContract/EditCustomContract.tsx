import React from 'react';
import {useParams} from 'react-router-dom';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import api from '../../../../api';
import {ErrorDuplicateUsingHousing, FORM_NAMES} from '../constants';
import {Country, CustomDocument} from '../../../../utils/types';
import {toastResponseError} from '../../../../utils/common';
import {useCountriesOptions} from '../../../../hooks/useCountriesOptions';
import {useIsMounted} from '../../../../utils/hooks';
import {CustomContract} from '../CustomContract';
import {LoaderStyled} from '../styled';

function EditCustomContract() {
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const {id: customContractId} = useParams<{id: string}>();

  const customContractQueryKey = api.documents.ENDPOINTS.customDocuments(
    customContractId,
  );
  const {data: customContract, isLoading: isLoadingCustomContract} = useQuery<
    CustomDocument
  >(api.documents.ENDPOINTS.customDocuments(customContractId), {
    enabled: Boolean(customContractId),
  });

  const countryCode = (customContract?.country as Country)?.code;

  const {countriesOptions} = useCountriesOptions({enabled: Boolean(countryCode)});

  const countryOption = React.useMemo(() => {
    return countriesOptions?.find((country) => countryCode === country.value);
  }, [countriesOptions, countryCode]);

  const {isLoading: isLoadingMutation, mutate: customContractMutation} = useMutation<
    CustomDocument,
    string[],
    Partial<CustomDocument>
  >((payload) => api.documents.updateCustomDocument({...payload, id: customContractId}), {
    retry: 1,
    onSuccess: (data) => {
      queryClient.setQueryData(customContractQueryKey, data);
    },
    onError: (errors) => {
      const error = errors?.[0] as string;
      if (error.startsWith(ErrorDuplicateUsingHousing) || !isMounted.current) {
        return;
      }
      toastResponseError(error);
    },
  });

  const defaultValues = {
    [FORM_NAMES.name]: customContract?.name,
    [FORM_NAMES.title]: customContract?.title,
    [FORM_NAMES.country]: countryOption,
    [FORM_NAMES.text_format]: customContract?.text_format,
    [FORM_NAMES.html_format]: customContract?.html_format,
  };
  const isLoading = !customContract || !countriesOptions.length;

  return isLoading ? (
    <LoaderStyled height={80} width={80} />
  ) : (
    <CustomContract
      title={customContract!.name}
      submitAction={customContractMutation}
      checkboxesSource={customContract!.housings}
      defaultFormValues={defaultValues}
      isLoading={isLoadingMutation || isLoadingCustomContract}
    />
  );
}

export {EditCustomContract};
