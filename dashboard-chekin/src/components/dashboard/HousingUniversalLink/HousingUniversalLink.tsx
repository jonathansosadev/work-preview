import React from 'react';
import {useTranslation} from 'react-i18next';
import Section from '../Section';
import CopyLinkButton from '../CopyLinkButton';
import {Wrapper, ShareLinkInput} from './styled';

function HousingUniversalLink({link}: {link: string}) {
  const {t} = useTranslation();
  const linkInputRef = React.useRef<HTMLInputElement>(null);

  const copyLinkToClipboard = () => {
    linkInputRef.current?.select();
    document.execCommand('copy');
  };

  return (
    <Section
      title={t('property_checkin_link')}
      subtitle={t('property_checkin_link_description')}
    >
      <Wrapper>
        <ShareLinkInput
          readOnly
          ref={linkInputRef}
          onClick={copyLinkToClipboard}
          value={link}
        />
        <CopyLinkButton link={link} />
      </Wrapper>
    </Section>
  );
}

export {HousingUniversalLink};
