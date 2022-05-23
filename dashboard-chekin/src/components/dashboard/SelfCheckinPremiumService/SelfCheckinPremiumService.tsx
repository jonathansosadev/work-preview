import React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useQueryClient} from 'react-query';
import api from '../../../api';
import {useSubscription} from '../../../context/subscription';
import editIcon from '../../../assets/edit-button-white.svg';
import deleteIcon from '../../../assets/rubbish-bin.svg';
import {useErrorModal, useIsMounted, useStatus} from '../../../utils/hooks';
import {
  PremiumServiceName,
  PremiumServiceWrapper,
  NameTooltip,
  EditPremiumServiceButton,
  DeletePremiumServiceButton

} from './styled';

function SelfCheckinPremiumService() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();
  const history = useHistory();
  const {ErrorModal, displayError} = useErrorModal();
  const {refreshSubscription, isSelfCheckinActive} = useSubscription();
  const {
    isLoading: isDeactivatingSelfCheckin,
    setStatus: setDeactivatingSelfCheckinStatus,
  } = useStatus();

  const deactivateSelfCheckin = async () => {
    setDeactivatingSelfCheckinStatus('loading');
    const {error} = await api.housings.deactivateSelfCheckin();

    if (!isMounted.current) {
      return;
    }

    await refreshSubscription();
    await queryClient.refetchQueries('selfCheckInShortHousings');
    await queryClient.refetchQueries('housings');
    setDeactivatingSelfCheckinStatus('idle');

    if (error) {
      displayError(error);
    }
  };

  if (!isSelfCheckinActive) {
    return null;
  }

  return (
    <div>
      <PremiumServiceWrapper blinking={isDeactivatingSelfCheckin}>
        <PremiumServiceName>
          <div>
            {t('self_checkin')} <NameTooltip content={t('self_checkin_pricing_notes')} />
          </div>
        </PremiumServiceName>
        <div>
          {isSelfCheckinActive && (
            <EditPremiumServiceButton
              disabled={isDeactivatingSelfCheckin}
              isLoading={isDeactivatingSelfCheckin}
              onClick={() => history.push('/billing/services/self-checkin')}
            >
              <img src={editIcon} alt="Pen" />
            </EditPremiumServiceButton>
          )}
          <DeletePremiumServiceButton
            disabled={isDeactivatingSelfCheckin}
            isLoading={isDeactivatingSelfCheckin}
            onClick={deactivateSelfCheckin}
          >
            <img src={deleteIcon} alt="Trash" />
          </DeletePremiumServiceButton>
        </div>
      </PremiumServiceWrapper>
      <ErrorModal />
    </div>
  );
}

export {SelfCheckinPremiumService};
