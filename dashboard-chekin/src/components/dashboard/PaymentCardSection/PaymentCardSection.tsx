import React from 'react';
import {useQueryClient, useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {
  CardElement,
  Elements,
  injectStripe,
  ReactStripeElements,
  IbanElement,
} from 'react-stripe-elements';
import {useUser} from '../../../context/user';
import {PAYMENT_METHOD, EUR_PAYMENT_METHOD} from '../../../utils/constants';
import {toast} from 'react-toastify';
import api, {queryFetcher} from '../../../api';
import {addSupportEmailToMessage} from '../../../utils/common';
import i18n from '../../../i18n';
import {Card, SelectOption} from '../../../utils/types';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useStatus,
} from '../../../utils/hooks';
import Loader from '../../common/Loader';
import CardPlaceholder from '../CardPlaceholder';
import IbanPlaceholder from '../IbanPlaceholder';
import Section from '../Section';
import Select from '../Select';
import Input from '../Input';
import {
  ButtonLabelWrapper,
  stripeInputStyle,
  Form,
  ButtonWrapper,
  LoaderWrapper,
  CardNotAddedText,
  CardPlaceholderWrapper,
  MarginTop,
  PaymentButton,
  IbanLabel,
  ImportantInfo,
} from './styled';

function toastStripeError(error: stripe.Error) {
  if (error?.message) {
    toast.error(addSupportEmailToMessage(error?.message));
  } else {
    console.error(error);
  }
}

function fetchCard() {
  return queryFetcher(api.payments.ENDPOINTS.paymentMethod());
}

function fetchStripeSecret() {
  return queryFetcher(api.payments.ENDPOINTS.secret());
}

type StripeSecret = {
  secret: string;
};

type PaymentCardSectionProps = {
  stripe?: ReactStripeElements.StripeProps;
};

function PaymentCardSection({stripe}: PaymentCardSectionProps) {
  const {t} = useTranslation();
  const user = useUser();
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();
  const history = useHistory();
  const {ErrorModal, displayError} = useErrorModal();
  const {isLoading, setStatus} = useStatus();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCardReady, setIsCardReady] = React.useState(false);
  const [paymentMethodSelected, setPaymentMethodSelected] = React.useState<
    SelectOption
  >();
  const [sepaName, setSepaName] = React.useState<string>('');
  const [sepaEmail, setSepaEmail] = React.useState<string>('');
  const [emptySepaName, setEmptySepaName] = React.useState<boolean>(true);
  const [emptySepaEmail, setEmptySepaEmail] = React.useState<boolean>(true);

  const {
    data: paymentMethod,
    error: paymentMethodError,
    status: paymentMethodStatus,
  } = useQuery('paymentMethod', fetchCard, {
    refetchOnWindowFocus: false,
  });
  useErrorToast(paymentMethodError);
  const {data: stripeSecret, error: stripeSecretError} = useQuery<StripeSecret, string>(
    'stripeSecret',
    fetchStripeSecret,
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  );
  useErrorToast(paymentMethodError, {
    notFoundMessage: 'Requested card could not be found. Please contact support.',
  });
  useErrorToast(stripeSecretError, {
    notFoundMessage: 'Unable to find stripe Secret. Please contact support.',
  });

  const isLoadingPaymentMethod = paymentMethodStatus === 'loading';
  const card: Card = paymentMethod?.card;

  React.useEffect(() => {
    if (isLoadingPaymentMethod) {
      return;
    }

    if (paymentMethod?.card) {
      setIsEditing(!Boolean(paymentMethod?.card));
    }

    if (paymentMethod?.sepa_debit) {
      setIsEditing(!Boolean(paymentMethod?.sepa_debit));
    }
  }, [paymentMethod, isLoadingPaymentMethod]);

  React.useEffect(() => {
    if (sepaName?.length > 0) {
      setEmptySepaName(false);
    } else {
      setEmptySepaName(true);
    }
  }, [sepaName]);

  React.useEffect(() => {
    if (sepaEmail?.length > 0) {
      setEmptySepaEmail(false);
    } else {
      setEmptySepaEmail(true);
    }
  }, [sepaEmail]);

  React.useEffect(() => {
    if (paymentMethod?.card) {
      setPaymentMethodSelected({label: t('credit_debit_card'), value: 'CARD'});
    }

    if (paymentMethod?.sepa_debit) {
      setPaymentMethodSelected({label: t('sepa'), value: 'SEPA_DEBIT'});
    }
  }, [paymentMethod, t]);

  const startEditing = () => {
    setIsEditing(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  const handleCardReady = () => {
    setIsCardReady(true);
  };

  const deleteUserCard = async () => {
    const {error} = await api.payments.deleteUserCard();

    if (!isMounted.current) {
      return;
    }

    if (error) {
      displayError(error);
      return false;
    }
    return true;
  };

  const createAndGetStripeToken = async () => {
    if (paymentMethodSelected?.value === 'SEPA_DEBIT') {
      const {error, source} = await stripe!.createSource({
        type: 'sepa_debit',
        currency: 'eur',
        owner: {
          name: sepaName,
          email: sepaEmail,
        },
        mandate: {
          notification_method: 'email',
        },
      });

      if (!isMounted.current) {
        return;
      }

      if (error) {
        displayError(error);
        return null;
      }
      return source;
    }

    const {error, token} = await stripe!.createToken({
      currency: 'eur',
    });

    if (!isMounted.current) {
      return;
    }

    if (error) {
      displayError(error);
      return null;
    }
    return token;
  };

  const createAndGetStripePaymentMethod = async (token: any) => {
    if (!token || !stripeSecret?.secret) {
      return null;
    }

    const {setupIntent, error} = await stripe!.confirmCardSetup(stripeSecret?.secret, {
      payment_method: {
        card: {
          token: token.id,
        },
      },
    });

    if (!isMounted.current) {
      return;
    }

    if (error) {
      toastStripeError(error);
      return null;
    }
    return setupIntent?.payment_method;
  };

  const createPaymentMethod = async (payment_method: any) => {
    if (paymentMethodSelected?.value === 'SEPA_DEBIT') {
      if (!payment_method) {
        return;
      }

      const {data, error} = await api.payments.bindUserCard(payment_method);

      if (!isMounted.current) {
        return;
      }

      if (error) {
        displayError(error);
        return false;
      }

      return data?.status === 'ok';
    }

    if (!payment_method) {
      return;
    }

    const {data, error} = await api.payments.bindUserCard({payment_method});

    if (!isMounted.current) {
      return;
    }

    if (error) {
      displayError(error);
      return false;
    }

    return data?.status === 'ok';
  };

  const finishSubmitting = () => {
    setStatus('idle');
    setIsEditing(false);
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');

    if (card) {
      const isOk = await deleteUserCard();
      if (!isOk) {
        finishSubmitting();
        return;
      }
    }

    const token = await createAndGetStripeToken();
    if (!token) {
      setStatus('idle');
      return;
    }

    const paymentMethod = await createAndGetStripePaymentMethod(token);
    if (!paymentMethod) {
      finishSubmitting();
      return;
    }

    const isOk = await createPaymentMethod(paymentMethod);
    if (!isOk) {
      finishSubmitting();
      return;
    }

    queryClient.refetchQueries('paymentMethod');
    queryClient.refetchQueries('stripeSecret');
    history.push('/subscription/payment-info');
  };

  const handleSubmitSepa = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');

    if (card) {
      const isOk = await deleteUserCard();
      if (!isOk) {
        finishSubmitting();
        return;
      }
    }

    const source = await createAndGetStripeToken();
    if (!source) {
      setStatus('idle');
      return;
    }

    const isOk = await createPaymentMethod({
      payment_method: source.id,
      payment_method_type: 'SEPA_DEBIT',
    });

    if (!isOk) {
      finishSubmitting();
      return;
    }

    queryClient.refetchQueries('paymentMethod');
    queryClient.refetchQueries('stripeSecret');
    history.push('/subscription/payment-info');
  };

  return (
    <Section title={t('payment_method')}>
      {!isLoading && !card && Object.keys(paymentMethod).length === 0 && (
        <CardNotAddedText>{i18n.t('not_payment_method')}</CardNotAddedText>
      )}
      <Select
        disabled={isLoading}
        label={t('select_payment_method')}
        onChange={(type: any) => {
          setPaymentMethodSelected(type);
        }}
        value={paymentMethodSelected}
        options={Object.values(
          user?.currency !== 'eur' ? PAYMENT_METHOD : EUR_PAYMENT_METHOD,
        )}
      />
      {paymentMethodSelected?.value === 'CARD' && (
        <>
          <MarginTop />
          {!isLoading && !isEditing && Boolean(paymentMethod?.card) && (
            <>
              <CardPlaceholderWrapper>
                <CardPlaceholder />
              </CardPlaceholderWrapper>
              <PaymentButton
                type="button"
                onClick={startEditing}
                label={t('change_payment_method')}
              />
            </>
          )}
          {!isLoading && !isEditing && !Boolean(paymentMethod?.card) && (
            <PaymentButton onClick={startEditing} label={t('add_card')} />
          )}
          {isEditing && (
            <Form onSubmit={handleSubmit}>
              <CardElement onReady={handleCardReady} style={stripeInputStyle} />
              {isLoading || !isCardReady ? (
                <LoaderWrapper>
                  <Loader width={40} height={40} />
                </LoaderWrapper>
              ) : (
                <ButtonWrapper>
                  <PaymentButton type="submit" label={t('add_card')} />
                  <PaymentButton
                    danger
                    type="button"
                    onClick={stopEditing}
                    label={<ButtonLabelWrapper>{t('cancel')}</ButtonLabelWrapper>}
                  />
                </ButtonWrapper>
              )}
            </Form>
          )}
          {(isLoading || isLoadingPaymentMethod) && !isEditing && (
            <LoaderWrapper>
              <Loader width={40} height={40} />
            </LoaderWrapper>
          )}
        </>
      )}

      {paymentMethodSelected?.value === 'SEPA_DEBIT' && (
        <>
          <MarginTop />
          {!isLoading && !isEditing && Boolean(paymentMethod?.sepa_debit) && (
            <>
              <CardPlaceholderWrapper>
                <IbanPlaceholder />
              </CardPlaceholderWrapper>
              <PaymentButton
                type="button"
                onClick={startEditing}
                label={t('change_payment_method')}
              />
            </>
          )}
          {!isLoading && !isEditing && !Boolean(paymentMethod?.sepa_debit) && (
            <PaymentButton onClick={startEditing} label={t('enable_sepa')} />
          )}
          {isEditing && (
            <Form onSubmit={handleSubmitSepa}>
              <Input
                label="Nombre"
                placeholder={t('enter_full_name')}
                required={true}
                empty={emptySepaName}
                value={sepaName}
                onChange={(event) => {
                  setSepaName(event.target.value);
                }}
              />
              <Input
                label="Correo"
                placeholder={t('enter_email_sepa')}
                required={true}
                empty={emptySepaEmail}
                value={sepaEmail}
                onChange={(event) => {
                  setSepaEmail(event.target.value);
                }}
              />
              <IbanLabel>IBAN</IbanLabel>
              <IbanElement
                onReady={handleCardReady}
                supportedCountries={['SEPA']}
                placeholderCountry={'DE'}
              />
              <ImportantInfo>{t('sepa_details')}</ImportantInfo>
              {isLoading || !isCardReady ? (
                <LoaderWrapper>
                  <Loader width={40} height={40} />
                </LoaderWrapper>
              ) : (
                <ButtonWrapper>
                  <PaymentButton outlined type="submit" label={t('enable_sepa')} />
                  <PaymentButton
                    danger
                    type="button"
                    onClick={stopEditing}
                    label={t('cancel')}
                  />
                </ButtonWrapper>
              )}
            </Form>
          )}
          {(isLoading || isLoadingPaymentMethod) && !isEditing && (
            <LoaderWrapper>
              <Loader width={40} height={40} />
            </LoaderWrapper>
          )}
        </>
      )}
      <ErrorModal title={t('invalid_credit_card')} />
    </Section>
  );
}

const InjectedPaymentCardSection = injectStripe(PaymentCardSection);

function ElementsInjectedPaymentCardSection() {
  return (
    <Elements>
      <InjectedPaymentCardSection />
    </Elements>
  );
}

export {ElementsInjectedPaymentCardSection};
