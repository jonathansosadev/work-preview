import React from 'react';
import {ShareStatic} from 'react-native';
import {Column, Row, useTable} from 'react-table';
import {useHistory} from 'react-router-dom';
import {isMobile} from 'react-device-detect';
import {useTranslation} from 'react-i18next';
import i18next from 'i18next';
import {useReservation} from '../../context/reservation';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {useStoredURLParams} from '../../context/storedURLParams';
import {Guest} from '../../utils/types';
import {checkIsDocTypeWithDuplexScan} from '../../utils/docTypes';
import {getGuestLeaderId, getMembers, getNumberOfGuests} from '../../utils/reservation';
import {EMAIL_SHARE_LINK, WHATSAPP_SHARE_LINK} from '../../utils/constants';
import successSmall from '../../assets/success-small.svg';
import errorSmall from '../../assets/error-small.svg';
import email from '../../assets/email.svg';
import whatsApp from '../../assets/whatsApp_icon.svg';
import shareMobile from '../../assets/share-mobile.svg';
import countGuestsVerified from '../../assets/count-guests-verified.svg';
import Header from '../Header';
import CopyLinkButton from '../shared/CopyLinkButton';
import {PageContentWrapper, CapitalizeWrapper} from '../../styled/common';
import {
  SubTitle,
  Title,
  HeaderPageContent,
  GroupButtons,
  GuestName,
  TableWrapper,
  RowErrorIcon,
  RowSuccessIcon,
  RetryButton,
  ShareButton,
  ShareButtonWhatsApp,
  GuestTableLoaderWrapper,
  GuestTableLoader,
  CounterGuestsTitle,
  ImageGuests,
  LoaderStyled,
  AddGuestButton,
  GuestStatus,
} from './styled';

const columnsIds = {
  name: 'NAME',
  biomatchStatus: 'BIOMATCH_PASSED',
};

function getEmailSubjectAndBody(shareLink = '') {
  return {
    subject: i18next.t('complete_identity_verification_email_subtitle'),
    body: i18next.t('complete_identity_verification_email_body', {link: shareLink}),
  };
}

function getShareMessage(shareLink = '') {
  return encodeURI(
    i18next.t('complete_iden_verif_whatsapp_repeat', {
      link: shareLink,
    }),
  );
}

function GuestsIdentityInformation() {
  const {t} = useTranslation();
  const history = useHistory();
  const {data: reservation, isLoading: isLoadingReservation} = useReservation();
  const {
    isBiomatchOnlyForGuestLeader,
    isVerifyDocumentAndSelfie,
    isVerifyOnlyDocument,
    isSelfCheckinEnabled,
  } = useComputedReservationDetails();
  const guests = getMembers(reservation);
  const leaderGuestId = getGuestLeaderId(reservation);
  const {shortShareLink} = useStoredURLParams();
  const countVerifiedGuests = React.useMemo(() => {
    return guests?.filter((singleGuest: Guest) => {
      return singleGuest.biomatch_passed;
    })?.length;
  }, [guests]);
  const countAllGuests = guests?.length;
  const isEveryGuestPassed = reservation?.all_guests_passed_biomatch;
  const hasPendingGuests = guests.length < getNumberOfGuests(reservation);

  const handleShareByEmail = () => {
    const email = getEmailSubjectAndBody(shortShareLink);
    window.open(`${EMAIL_SHARE_LINK}?subject=${email.subject}&body=${email.body}`);
  };

  const handleShareByWhatsApp = () => {
    window.open(`${WHATSAPP_SHARE_LINK}?text=${getShareMessage(shortShareLink)}`);
  };

  const handleShareMobile = () => {
    const navigator = window.navigator as Navigator & ShareStatic;
    if (navigator && navigator.share) {
      navigator.share({url: shortShareLink});
    }
  };

  const handleClickRetry = React.useCallback(
    (guest: Guest) => {
      const locationState = {isRetryBiomatch: true, guestId: guest.id};
      if (isVerifyDocumentAndSelfie) {
        return history.push('/verification/document', locationState);
      }
      const docType = guest.document?.type;
      const nationality = guest.nationality?.code;
      if (checkIsDocTypeWithDuplexScan({docType, nationality})) {
        history.push('/scan/front-side', locationState);
      } else {
        history.push('/scan/passport', locationState);
      }
    },
    [history, isVerifyDocumentAndSelfie],
  );

  const handleAddGuest = () => {
    history.replace('');
    history.push('/');
  };

  const renderBiomatchStatus = React.useCallback(
    (guest: Guest) => {
      const isLeader = leaderGuestId === guest.id;
      if (isBiomatchOnlyForGuestLeader && !isLeader) {
        return null;
      }

      const isBiomatchPassed = isVerifyDocumentAndSelfie && guest.biomatch_passed;
      const isDocumentPassed = isVerifyOnlyDocument && guest.document_passed;

      if (isBiomatchPassed || isDocumentPassed) {
        return (
          <GuestName>
            <CapitalizeWrapper>
              {t('approved')}
              <RowSuccessIcon src={successSmall} alt="Approved" />
            </CapitalizeWrapper>
          </GuestName>
        );
      }

      return (
        <GuestStatus pale>
          <div>
            {t('pending')}
            <RowErrorIcon src={errorSmall} alt="Error" />
          </div>

          <RetryButton
            label={t('retry')}
            type="button"
            onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleClickRetry(guest);
            }}
          />
        </GuestStatus>
      );
    },
    [
      handleClickRetry,
      isBiomatchOnlyForGuestLeader,
      isVerifyDocumentAndSelfie,
      isVerifyOnlyDocument,
      leaderGuestId,
      t,
    ],
  );

  const columns = React.useMemo<Column<Guest>[]>(
    () => [
      {
        id: columnsIds.name,
        Header: t('guest_name') as string,
        accessor: 'full_name',
        Cell: ({value}) => {
          return (
            <GuestName>
              <CapitalizeWrapper>{value.toLowerCase()}</CapitalizeWrapper>
            </GuestName>
          );
        },
      },
      {
        id: columnsIds.biomatchStatus,
        Header: t('identity_verification') as string,
        accessor: 'biomatch_passed',
        Cell: ({row}: {row: Row<Guest>}) => {
          return renderBiomatchStatus(row.original);
        },
      },
    ],
    [renderBiomatchStatus, t],
  );

  const hiddenColumns = React.useMemo(() => {
    const columns = [];
    if (!isSelfCheckinEnabled) columns.push(columnsIds.biomatchStatus);
    return columns;
  }, [isSelfCheckinEnabled]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setHiddenColumns,
  } = useTable({
    columns,
    data: guests,
    initialState: {
      hiddenColumns,
    },
  });

  React.useEffect(() => {
    setHiddenColumns(hiddenColumns);
  }, [hiddenColumns, setHiddenColumns]);

  return (
    <>
      <Header hideBackButton title={t('verify_your_identity')} />
      <PageContentWrapper>
        {isLoadingReservation ? (
          <LoaderStyled width={300} />
        ) : (
          <>
            <HeaderPageContent>
              <Title>
                {isEveryGuestPassed
                  ? t('identity_verification_completed')
                  : t('identity_verification_pending')}
              </Title>
              <SubTitle>
                {isEveryGuestPassed
                  ? t('identity_verification_completed_text')
                  : t('identity_verification_pending_text')}
              </SubTitle>
            </HeaderPageContent>
            {isEveryGuestPassed ? (
              <div>
                <CounterGuestsTitle>{`${countVerifiedGuests}/${countAllGuests} ${t(
                  'guests_verified',
                )}`}</CounterGuestsTitle>
                <ImageGuests src={countGuestsVerified} alt="" />
              </div>
            ) : (
              <>
                <GroupButtons>
                  {isMobile ? (
                    <ShareButton
                      link
                      onClick={handleShareMobile}
                      icon={<img src={shareMobile} height={16} width={16} alt="Share" />}
                      label={t('share_page')}
                    />
                  ) : (
                    <>
                      <ShareButton
                        link
                        onClick={handleShareByEmail}
                        icon={<img src={email} height={16} width={16} alt="Mail" />}
                        label={t('share_by_email')}
                      />
                      <ShareButtonWhatsApp
                        link
                        onClick={handleShareByWhatsApp}
                        icon={
                          <img src={whatsApp} height={21} width={21} alt="WhatsApp" />
                        }
                        label={t('share_by_whatsapp')}
                      />
                      <CopyLinkButton link={shortShareLink} />
                    </>
                  )}
                </GroupButtons>
                <TableWrapper>
                  <table {...getTableProps()}>
                    <thead>
                      {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                          {headerGroup.headers.map(column => {
                            return (
                              <th {...column.getHeaderProps()}>
                                {column.render('Header')}
                              </th>
                            );
                          })}
                        </tr>
                      ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                      {isLoadingReservation ? (
                        <GuestTableLoaderWrapper>
                          <td colSpan={10}>
                            <GuestTableLoader hideBorder label={t('loading')} />
                          </td>
                        </GuestTableLoaderWrapper>
                      ) : (
                        rows.map(row => {
                          prepareRow(row);
                          return (
                            <tr {...row.getRowProps()} onClick={() => {}}>
                              {row.cells.map(cell => {
                                return (
                                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                      {hasPendingGuests && (
                        <tr>
                          <td>
                            <AddGuestButton
                              label={t('add_guest')}
                              onClick={handleAddGuest}
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </TableWrapper>
              </>
            )}
          </>
        )}
      </PageContentWrapper>
    </>
  );
}

export {GuestsIdentityInformation};
