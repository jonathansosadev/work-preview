import React from 'react';
import {useForm} from 'react-hook-form';
import {Trans, useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {toast} from 'react-toastify';
import api, {removeUserTokenFromLocalStorage} from '../../../api';
import {
  useIsMounted,
  useScrollToTop,
  useStatus,
  useWarningModal,
} from '../../../utils/hooks';
import {mixpanelIdentify} from '../../../analytics/mixpanel';
import {useAuth} from '../../../context/auth';
import {addSupportEmailToMessage, getErrorMessage} from '../../../utils/common';
import {PATTERNS} from '../../../utils/constants';
import chekinLogoImage from '../../../assets/chekin-imago-blue.svg';
import receptionIllustration from '../../../assets/reception_illustration.png';
import receptionIllustration2x from '../../../assets/reception_illustration@2x.png';
import receptionIllustration3x from '../../../assets/reception_illustration@3x.png';
import warningIcon from '../../../assets/warning-icon.svg';
import {defaultContentStyle} from '../../dashboard/Modal/styled';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';
import ModalButton from '../../dashboard/ModalButton';
import Loader from '../../common/Loader';
import {Wrapper} from '../RegisterForm';
import {
  FieldsWrapper,
  FormTile,
  TileTitle,
  ButtonAndLoaderWrapper,
  BottomText,
  ForgotPassword,
  Illustration,
  Logo,
  FieldWrapper,
  ModalImgWrapper,
  ModalContent,
  ModalTitle,
  ModalText,
} from './styled';

const IS_UNDER_MAINTENANCE = process.env.REACT_APP_MAINTENANCE_MODE;

const popupOverlayStyle = {
  background: '#ffffffb0',
};

const popupContentStyle = {
  width: '330px',
  padding: '0',
  minHeight: '420px',
  border: 'none',
  borderRadius: '8px',
  boxShadow: '0 15px 15px 0 rgba(38, 153, 251, 0.1)',
  backgroundColor: '#ffffff',
  marginTop: '91px',
};

enum FORM_NAMES {
  email = 'email',
  password = 'password',
}

type FormData = {
  email: string;
  password: string;
};

function LoginForm() {
  useScrollToTop();
  const {t} = useTranslation();
  const {
    register,
    handleSubmit,

    formState: {errors},
  } = useForm<FormData>();
  const {login} = useAuth();
  const isMounted = useIsMounted();
  const {WarningModal, displayWarning} = useWarningModal();
  const {setStatus, isLoading} = useStatus();
  const [showAccountDeactivatedModal, setShowAccountDeactivatedModal] = React.useState(
    false,
  );

  const getAuthToken = async (credentials = {}) => {
    const {data, error} = await api.auth.login(credentials);
    const token = data && data.token;

    if (isMounted.current && error) {
      if (error.is_deactivated) {
        setShowAccountDeactivatedModal(true);
      }
      toast.error(addSupportEmailToMessage(t('errors.login_failed')));
      return null;
    }
    return token;
  };

  const hideAccountDeactivatedModal = () => {
    setShowAccountDeactivatedModal(false);
  };

  const onSubmit = async (data: FormData) => {
    removeUserTokenFromLocalStorage();

    setStatus('loading');
    const token = await getAuthToken(data);

    if (!isMounted.current) {
      return;
    }

    if (token) {
      const {error} = await login(token);
      mixpanelIdentify(data.email);

      if (!isMounted.current) {
        return;
      }

      if (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(addSupportEmailToMessage(errorMessage));
      }
    }
    setStatus('idle');
  };

  return (
    <Wrapper>
      <WarningModal
        contentStyle={{
          ...defaultContentStyle,
          marginTop: 100,
        }}
      />
      <Logo src={chekinLogoImage} alt="Chekin" />
      <FormTile onSubmit={handleSubmit(onSubmit)}>
        <TileTitle>{t('login')}</TileTitle>
        <FieldsWrapper>
          <FieldWrapper>
            <Input
              placeholder={t('enter_your_email') as string}
              disabled={isLoading}
              label={t('email')}
              error={errors[FORM_NAMES.email]?.message}
              inputMode="email"
              {...register(FORM_NAMES.email, {
                pattern: {
                  value: PATTERNS.email,
                  message: t('invalid_email'),
                },
                required: t('required') as string,
              })}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              type="password"
              placeholder={t('enter_your_password') as string}
              disabled={isLoading}
              label={t('password')}
              error={errors[FORM_NAMES.password]?.message}
              {...register(FORM_NAMES.password, {
                required: t('required') as string,
              })}
            />
          </FieldWrapper>
        </FieldsWrapper>
        <ForgotPassword>
          <Link to="/forgot-password">
            <Button
              label={t('forgot_password').toUpperCase()}
              size="small"
              type="button"
              secondary
            />
          </Link>
        </ForgotPassword>
        <ButtonAndLoaderWrapper>
          {isLoading ? (
            <div data-testid="loader">
              <Loader />
            </div>
          ) : (
            <Button label={t('login')} data-testid="login-btn" type="submit" />
          )}
        </ButtonAndLoaderWrapper>
        <BottomText>
          {t('dont_have_an_acc')}
          <div>
            {IS_UNDER_MAINTENANCE ? (
              <Button
                label={t('register').toUpperCase()}
                size="small"
                type="button"
                secondary
                onClick={() =>
                  displayWarning(
                    <Trans i18nKey="maintenance_text">
                      <p>
                        We are currently updating the registration process, so you won't
                        be able to register and add properties in the next few hours.
                      </p>
                      Please, contact us by the chat and our team will create an account
                      or add properties for you as soon as we perform the update!
                    </Trans>,
                  )
                }
              />
            ) : (
              <Link to="/register/type?utm_source=RegisterDashboard">
                <Button
                  label={t('register').toUpperCase()}
                  size="small"
                  type="button"
                  secondary
                />
              </Link>
            )}
          </div>
        </BottomText>
      </FormTile>
      <Illustration
        src={receptionIllustration}
        srcSet={`${receptionIllustration} 1x, ${receptionIllustration2x} 2x, ${receptionIllustration3x} 3x`}
        alt="Reception"
      />
      {showAccountDeactivatedModal && (
        <Modal
          open
          hideCloseButton
          contentStyle={popupContentStyle}
          overlayStyle={popupOverlayStyle}
        >
          <ModalContent>
            <ModalImgWrapper>
              <img src={warningIcon} alt="warning" />
            </ModalImgWrapper>
            <ModalTitle>{t('oops_it_seems_your_account')}</ModalTitle>
            <ModalText>{t('if_you_want_to_restore')}</ModalText>
            <ModalText>1. {t('create_a_new_account')}</ModalText>
            <ModalText>2. {t('make_sure_you_use_the_same')}</ModalText>
            <ModalText>3. {t('your_account_will_be_restored')}</ModalText>
            <ModalButton label={t('got_it')} onClick={hideAccountDeactivatedModal} />
          </ModalContent>
        </Modal>
      )}
    </Wrapper>
  );
}

export {LoginForm};
