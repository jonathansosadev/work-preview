import React from 'react';
import useSWR from 'swr';
import {Controller, useForm} from 'react-hook-form';
import {useLocation, useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import api, {getURL} from '../../api';
import {useReservation} from '../../context/reservation';
import {getDocTypes} from '../../utils/docTypes';
import {Country, SelectOptionType} from '../../utils/types';
import {FORM_NAMES} from '../AddPersonalDataForm/AddPersonalDataForm';
import SubmitButton from '../SubmitButton';
import Select from '../Select';
import {DimensionsWrapper, FormFieldWrapper} from '../../styled/common';
import {Content, FieldsWrapper, TextLabel} from './styled';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';

function getLocationsAsOptions(data: {results: {country: Country}[]}) {
  const results = data?.results;

  if (!results) {
    return [];
  }

  return results.map(l => {
    return {
      value: l.country.code,
      label: l.country.name,
      alpha_3: l.country.alpha_3,
    };
  });
}

type FormTypes = {
  [FORM_NAMES.nationality]: SelectOptionType & {
    alpha_3: string;
  };
  [FORM_NAMES.docType]: SelectOptionType;
};

type LocationState = {
  formData?: any;
  [key: string]: any;
};

function AliceOnboardingSetupForm() {
  const {t} = useTranslation();
  const {data: reservation} = useReservation();
  const location = useLocation<LocationState>();
  const history = useHistory();
  const {isAliceOnboardingEnabled} = useComputedReservationDetails();
  const {control, watch, errors, handleSubmit, reset} = useForm<FormTypes>();

  const {data: locations, isValidating: isLoadingLocations} = useSWR(
    getURL(api.locations.ENDPOINTS.get('ordering=name')),
  );

  const nationality = watch(FORM_NAMES.nationality);

  const locationsAsOptions = React.useMemo(() => {
    return getLocationsAsOptions(locations);
  }, [locations]);
  const docTypesOptions = React.useMemo(() => {
    return getDocTypes(reservation, nationality?.value).filter(docType => {
      return docType.hasOwnProperty('aliceDocument');
    });
  }, [nationality, reservation]);

  React.useLayoutEffect(() => {
    if (!isAliceOnboardingEnabled) {
      history.push('/', location.state);
    }
  }, [history, isAliceOnboardingEnabled, location.state]);

  React.useEffect(() => {
    const formData = location.state?.formData;

    if (formData) {
      reset(formData);
    }
  }, [location.state, reset]);

  const getPersistedState = (formData: FormTypes) => {
    return {
      ...location.state,
      formData: {
        ...location.state?.formData,
        [FORM_NAMES.nationality]: formData[FORM_NAMES.nationality],
        [FORM_NAMES.docType]: formData[FORM_NAMES.docType],
      },
    };
  };

  const goNext = (formData: FormTypes) => {
    const state = getPersistedState(formData);
    history.push('/onboarding/form', state);
  };

  const onSubmit = (formData: FormTypes) => {
    goNext(formData);
  };

  return (
    <DimensionsWrapper>
      <Content>
        <TextLabel>{t('select_nationality_and_document_to_continue')}</TextLabel>
        <FieldsWrapper>
          <FormFieldWrapper>
            <Controller
              control={control}
              as={<Select />}
              rules={{required: t('required') as string}}
              label={t('nationality')}
              loading={isLoadingLocations}
              name={FORM_NAMES.nationality}
              error={(errors[FORM_NAMES.nationality] as any)?.message}
              options={locationsAsOptions}
            />
          </FormFieldWrapper>
          <FormFieldWrapper>
            <Controller
              control={control}
              as={<Select />}
              rules={{required: t('required') as string}}
              label={t('doc_type')}
              name={FORM_NAMES.docType}
              error={(errors[FORM_NAMES.docType] as any)?.message}
              options={docTypesOptions}
            />
          </FormFieldWrapper>
        </FieldsWrapper>
        <SubmitButton onClick={handleSubmit(onSubmit)} label={t('submit')} />
      </Content>
    </DimensionsWrapper>
  );
}

export {AliceOnboardingSetupForm};
