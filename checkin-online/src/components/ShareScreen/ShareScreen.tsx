import React from 'react';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import {useReservation} from '../../context/reservation';
import {useStoredURLParams} from '../../context/storedURLParams';
import {getHousingName, getHousingPicture} from '../../utils/reservation';
import {
  EMAIL_SHARE_LINK,
  LINK_COPIED_MESSAGE_TIMEOUT_MS,
  SMS_SHARE_LINK,
  WHATSAPP_SHARE_LINK,
} from '../../utils/constants';
import shareIcon from '../../assets/share-icon.svg';
import speechBubbleIcon from '../../assets/speech-bubble.svg';
import envelopeIcon from '../../assets/envelope.svg';
import whatsappIcon from '../../assets/whatsapp.svg';
import successIcon from '../../assets/checkmark-outlined.svg';
import Header from '../Header';
import {
  Wrapper,
  ShareImage,
  Title,
  ShareLinkInput,
  CopyButton,
  CopyButtonWrapper,
  ThreeDotsGroup,
  Dot,
  AltShareTitle,
  EmailShareLink,
  SMSShareLink,
  WhatsappShareLink,
  ShareLinkButtonsWrapper,
  LinkCopiedMessage,
  HousingLogoImage,
  HousingLogoContainer,
  Content,
  MobileHeaderSuccessIcon,
} from './styled';

function getEmailSubjectAndBody(reservation = {}, shareLink = '') {
  const housingName = getHousingName(reservation);

  return {
    subject: i18next.t('complete_online_checkin_email_subject'),
    body: i18next.t(`complete_online_checkin_email_body`, {housingName, link: shareLink}),
  };
}

function getShareMessage(reservation = {}, shareLink = '') {
  const housingName = getHousingName(reservation);

  return encodeURI(
    i18next.t('complete_iden_verif_whatsapp', {
      housingName,
      link: shareLink,
    }),
  );
}

export function ShareScreen() {
  const {t} = useTranslation();
  const linkInputRef = React.useRef<HTMLInputElement>(null);
  const timeoutRef = React.useRef<any>(0);
  const {data: reservation} = useReservation();
  const {shortShareLink} = useStoredURLParams();
  const [isCopied, setIsCopied] = React.useState(false);
  const housingPicture = getHousingPicture(reservation);

  React.useEffect(() => {
    if (isCopied) {
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, LINK_COPIED_MESSAGE_TIMEOUT_MS);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [isCopied]);

  const copyLinkToClipboard = () => {
    linkInputRef.current?.select();
    document.execCommand('copy');
    setIsCopied(true);
  };

  const shareByWhatsapp = () => {
    window.open(
      `${WHATSAPP_SHARE_LINK}?text=${getShareMessage(reservation, shortShareLink)}`,
    );
  };

  const shareBySMS = () => {
    window.open(
      `${SMS_SHARE_LINK};?&body=${getShareMessage(reservation, shortShareLink)}`,
    );
  };

  const shareByEmail = () => {
    const email = getEmailSubjectAndBody(reservation, shortShareLink);
    window.open(`${EMAIL_SHARE_LINK}?subject=${email.subject}&body=${email.body}`);
  };

  return (
    <Wrapper>
      <Header
        hideBackButton
        title={t('online_checkin')}
        subtitle={getHousingName(reservation)}
        MobileHeaderIcon={<MobileHeaderSuccessIcon src={successIcon} alt="Check mark" />}
      />
      <Content>
        <ShareImage src={shareIcon} alt="Checkin sharing hand" />
        {housingPicture && (
          <HousingLogoContainer>
            <HousingLogoImage src={housingPicture} alt="Checkin" />
          </HousingLogoContainer>
        )}
        <Title>{t('share_online_checkin')}</Title>
        <ShareLinkInput
          readOnly
          ref={linkInputRef}
          onClick={copyLinkToClipboard}
          value={shortShareLink}
        />
        <CopyButtonWrapper>
          {isCopied ? (
            <LinkCopiedMessage>{t('copied')}</LinkCopiedMessage>
          ) : (
            <CopyButton onClick={copyLinkToClipboard}>{t('copy_link')}</CopyButton>
          )}
        </CopyButtonWrapper>
        <ThreeDotsGroup>
          <Dot />
          <Dot />
          <Dot />
        </ThreeDotsGroup>
        <AltShareTitle>{t('or_share_by')}</AltShareTitle>
        <ShareLinkButtonsWrapper>
          <WhatsappShareLink onClick={shareByWhatsapp} label="Whatsapp">
            <img src={whatsappIcon} alt="Whatsapp" />
            <div>WHATSAPP</div>
          </WhatsappShareLink>
          <EmailShareLink onClick={shareByEmail} label="Email">
            <img src={envelopeIcon} alt="Envelope" />
            <div>EMAIL</div>
          </EmailShareLink>
          <SMSShareLink onClick={shareBySMS} label="SMS">
            <img src={speechBubbleIcon} alt="Speech bubble" />
            <div>SMS</div>
          </SMSShareLink>
        </ShareLinkButtonsWrapper>
      </Content>
    </Wrapper>
  );
}
