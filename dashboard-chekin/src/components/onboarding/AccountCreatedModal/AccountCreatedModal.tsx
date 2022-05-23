import React from 'react';
import Modal from '../Modal';
import ModalButton from '../../dashboard/ModalButton';
import successChekinIcon from '../../../assets/new-chekin-square.svg';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import Loader from '../../common/Loader';
import {
  BoldText,
  PromptText,
  PromptTitle,
  SuccessImgWrapper,
  ModalContent,
} from './styled';
import {useIsMounted} from '../../../utils/hooks';
import api, {removeUserTokenFromLocalStorage} from '../../../api';
import {mixpanelIdentify} from '../../../analytics/mixpanel';
import {useAuth} from '../../../context/auth';

const popupOverlayStyle = {
  background: '#ffffffb0',
};

const popupContentStyle = {
  width: '300px',
  padding: '0',
  paddingTop: '50px',
  minHeight: '350px',
  border: 'none',
  borderRadius: '8px',
  boxShadow: '0 15px 15px 0 rgba(38, 153, 251, 0.1)',
  backgroundColor: '#ffffff',
  marginTop: '91px',
};

type AccountCreatedModalProps = {
  email: string;
  password: string;
};

const defaultProps: AccountCreatedModalProps = {
  email: '',
  password: '',
};

function AccountCreatedModal({email, password}: AccountCreatedModalProps) {
  const isMounted = useIsMounted();
  const {t} = useTranslation();
  const history = useHistory();
  const [isLoading, setIsLoading] = React.useState(false);
  const {login} = useAuth();

  const getAuthToken = async (credentials = {}) => {
    const {data, error} = await api.auth.login(credentials);
    const token = data && data.token;

    if (isMounted.current && error) {
      return null;
    }
    return token;
  };

  const goToLogin = () => {
    history.push('/properties');
  };

  const checkCredentialsAndTryToLogin = async () => {
    setIsLoading(true);
    if (email && password) {
      tryToLogin();
    } else {
      await goToLogin();
    }
    setIsLoading(false);
  };

  const tryToLogin = async () => {
    removeUserTokenFromLocalStorage();

    const payload = {
      email: email,
      password: password,
    };
    const token = await getAuthToken(payload);

    if (!isMounted.current) {
      return;
    }

    if (token) {
      const {error} = await login(token);
      mixpanelIdentify(email);

      if (!isMounted.current) {
        return;
      }

      if (error) {
        goToLogin();
      }
    }
  };

  return (
    <Modal
      open
      contentStyle={popupContentStyle}
      overlayStyle={popupOverlayStyle}
      hideCloseButton
    >
      <ModalContent>
        <SuccessImgWrapper>
          <img src={successChekinIcon} alt="success" />
        </SuccessImgWrapper>
        <PromptTitle>{t('success')}!</PromptTitle>
        <PromptText>
          <BoldText>{t('chekin_is_connected_and_syncing')}</BoldText>
          {t('sync_can_take_few')}
        </PromptText>
        {isLoading ? (
          <Loader height={40} />
        ) : (
          <ModalButton onClick={checkCredentialsAndTryToLogin} label={t('login')} />
        )}
      </ModalContent>
    </Modal>
  );
}

AccountCreatedModal.defaultProps = defaultProps;
export {AccountCreatedModal};
