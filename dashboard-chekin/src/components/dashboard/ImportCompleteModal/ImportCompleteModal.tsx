import React from 'react';
import {useTranslation} from 'react-i18next';
import {useOpenModals} from '../../../context/openModals';
import {useWebsocket, ContextProps as WsProps} from '../../../context/websocket';
import {RESERVATION, VALIDATION_STATUSES, WS_EVENT_TYPES} from '../../../utils/constants';
import importCompleteIcon from '../../../assets/import-completed-icon.svg';
import errorIcon from '../../../assets/error-icon.svg'
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {
  ButtonWrapper,
  ImportantText,
  StyledIcon,
  Title,
  Warning,
  Wrapper,
  LoaderWrapper,
} from './styled';
import Loader from '../../common/Loader';

function ImportCompleteModal() {
  const {t} = useTranslation();
  const ws = useWebsocket();
  const openModals = useOpenModals();

  const [failedRows, setFailedRows] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSuccessImport = React.useCallback(() => {
    const isReservationImport = openModals.importType === RESERVATION;

    if (isReservationImport) {
      setSuccessMessage(t('import_complete_success_reservations'));
      return;
    }

    setSuccessMessage(t('import_complete_success_housings'));
  }, [t, openModals]);

  const handleFailedImport = React.useCallback(
    (ws: WsProps) => {
      const failedRows = ws.message?.failed_rows?.join(', ');
      setFailedRows(failedRows);

      if (!failedRows) {
        setFailedRows(t('all_lines_are_invalid'));
      }
    },
    [t],
  );

  React.useEffect(() => {
    const isImportMessageWithStatus =
      ws.message?.event_type === WS_EVENT_TYPES.importXLSXFinished && ws.message?.status;
    if (!isImportMessageWithStatus) {
      return;
    }

    const isSuccessMessage = ws.message?.status === VALIDATION_STATUSES.complete;
    if (isSuccessMessage) {
      handleSuccessImport();
    }

    const isErrorMessage = ws.message?.status === VALIDATION_STATUSES.error;
    if (isErrorMessage) {
      handleFailedImport(ws);
    }

    return () => ws.clearMessage();
  }, [handleSuccessImport, handleFailedImport, t, ws]);

  const closeModal = () => {
    openModals.setImportType('');
    setFailedRows('');
    setSuccessMessage('');
  };

  return (
    <Modal open={Boolean(openModals.importType)}>
      <Wrapper>
        <StyledIcon src={failedRows ? errorIcon : importCompleteIcon} alt="ImportComplete" />
        <Title>{t('import_completed_capital')}</Title>
        {!successMessage && !failedRows && (
          <LoaderWrapper>
            <Loader height={40} width={40} label={t('loading')} />
          </LoaderWrapper>
        )}
        <Warning>{successMessage}</Warning>
        {failedRows && (
          <>
            <Warning>
              {openModals.importType === RESERVATION
                ? t('import_rows_error_reservation')
                : t('import_rows_error_housing')}
            </Warning>
            <ImportantText>{failedRows}.</ImportantText>
            <Warning>
              {openModals.importType === RESERVATION
                ? t('check_excel_or_support_reservation')
                : t('check_excel_or_support_housing')}
            </Warning>
          </>
        )}
        {!successMessage &&
        <Warning>
          <ImportantText>{t('important')}</ImportantText>
          {openModals.importType === RESERVATION
              ? t('import_important_reservation')
              : t('import_important_housing')}
        </Warning>
        }
        <ButtonWrapper isMessageEmpty={Boolean(failedRows)}>
          <ModalButton label={t('ok')} onClick={closeModal} />
        </ButtonWrapper>
      </Wrapper>
    </Modal>
  );
}

export {ImportCompleteModal};
