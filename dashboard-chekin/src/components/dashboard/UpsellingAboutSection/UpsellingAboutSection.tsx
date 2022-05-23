import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useHistory} from 'react-router';
import i18n from 'i18n';
import {getItemBasedOnLocale, Locales} from 'utils/common';
import {UPSELLING_LINKS} from '../../../utils/links';
import {useAuth} from 'context/auth';
import youtubeIcon from 'assets/youtube.svg';
import eBookIcon from 'assets/open-book.svg';
import blogIcon from 'assets/blog.svg';
import upsellingBg from 'assets/card-upselling-example.png';
import OfferTile from '../OfferTile';
import CreateOfferButton from '../CreateOfferButton';
import {StyledUpsellingSection, } from '../UpsellingSections';
import {
  Content,
  AboutUpsellingText1,
  AboutUpsellingText2,
  AboutUpsellingText3,
  AboutUpsellingText4,
  AboutArea,
  PreviewArea,
  HowItWorksText,
  HowItWorksItemsContainer,
  HowItWorksLink,
  TourIcon,
  HowItWorksIcon,
  Divider,
  OfferTileName,
} from './styled';

function UpsellingAboutSection() {
  const {t} = useTranslation();
  const history = useHistory();
  const {updateAccount} = useAuth();

  React.useEffect(() => {
    const hideThisSection = () => {
      if (history.location.pathname !== UPSELLING_LINKS.about) {
        updateAccount({want_see_upselling_instructions: false});
      }
    };
    return hideThisSection;
  }, [history, updateAccount]);

  return (
    <StyledUpsellingSection title={t('about_upselling_title')}>
      <Content>
        <AboutArea>
          <AboutUpsellingText1>
            <Trans i18nKey="about_upselling_1">
              Upselling is about persuading a guest to purchase something extra, something
              additional or something more expensive.{' '}
              <b>And this is going to change your business.</b>
            </Trans>
          </AboutUpsellingText1>
          <AboutUpsellingText2>{t('about_upselling_2')}</AboutUpsellingText2>
          <AboutUpsellingText3>{t('about_upselling_3')}</AboutUpsellingText3>
          <HowItWorks />
          <Divider />
          <AboutUpsellingText4>
            <Trans i18nKey="about_upselling_4">
              Or if you know all about upselling, you can start{' '}
              <b>creating your first deal</b> right now <b>(it’s free!)</b>:
            </Trans>
          </AboutUpsellingText4>
          <CreateOfferButton />
        </AboutArea>
        <PreviewArea>
          <OfferTile
            background={upsellingBg}
            title={t('early_checkin')}
            highlight={t('deal_example_description')}
            showPriceAndButton={true}
            price="6"
          />
          <OfferTileName>{t('deal_example_name')}</OfferTileName>
        </PreviewArea>
      </Content>
    </StyledUpsellingSection>
  );
}

enum HOW_WORKS_BUTTON_NAMES {
  watch_video = 'watch_video',
  read_post = 'read_post',
  download_ebook = 'download_ebook',
}

const LINKS = {
  [HOW_WORKS_BUTTON_NAMES.watch_video]: {
    [Locales.en]: 'https://www.youtube.com/watch?v=umui2R7iKZs',
    [Locales.es]: 'https://www.youtube.com/watch?v=mPiCwTbsCrM',
  },
  [HOW_WORKS_BUTTON_NAMES.read_post]: {
    [Locales.en]:
      'https://chekin.com/en/blog/what-it-is-upselling-in-vacation-rentals-and-hotels/',
    [Locales.es]:
      'https://chekin.com/blog/todo-acerca-del-funcionamiento-del-upselling-en-chekin/',
  },
  [HOW_WORKS_BUTTON_NAMES.download_ebook]: {
    [Locales.en]: 'https://indd.adobe.com/view/281f7f84-0263-40eb-aa05-26ca5ab0ae6e',
    [Locales.es]: 'https://indd.adobe.com/view/8262e0c0-d98f-4183-877e-b3c179520e2b',
  },
};

const withPreventDeafult = (
  callback: (...a: any[]) => void,
): React.MouseEventHandler<HTMLAnchorElement> => (
  e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
) => {
  e.preventDefault();
  callback(e);
};

const onButtonClick = (link: string) => {
  window.open(link, '_blank');
};

type ButtonInfoType = {
  id: HOW_WORKS_BUTTON_NAMES;
  icon: JSX.Element;
  text: string;
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
};
const HOW_WORKS_BUTTONS: ButtonInfoType[] = [
  {
    id: HOW_WORKS_BUTTON_NAMES.watch_video,
    onClick: withPreventDeafult(() =>
      onButtonClick(getItemBasedOnLocale(LINKS[HOW_WORKS_BUTTON_NAMES.watch_video])),
    ),
    icon: <HowItWorksIcon src={youtubeIcon} alt="youtubeIcon" height={17} width={23} />,
    text: i18n.t('watch_a_video'),
  },
  {
    id: HOW_WORKS_BUTTON_NAMES.read_post,
    onClick: withPreventDeafult(() =>
      onButtonClick(getItemBasedOnLocale(LINKS[HOW_WORKS_BUTTON_NAMES.read_post])),
    ),
    icon: <HowItWorksIcon src={blogIcon} alt="blogIcon" height={17} width={19} />,
    text: i18n.t('read_a_blog_post'),
  },
  {
    id: HOW_WORKS_BUTTON_NAMES.download_ebook,
    onClick: withPreventDeafult(() =>
      onButtonClick(getItemBasedOnLocale(LINKS[HOW_WORKS_BUTTON_NAMES.download_ebook])),
    ),
    icon: <TourIcon src={eBookIcon} alt="eBookIcon" width={20} />,
    text: i18n.t('download_e_book'),
  },
];

function HowItWorks() {
  const {t} = useTranslation();

  return (
    <>
      <HowItWorksText>{t('check_out_how_it_works')}</HowItWorksText>
      <HowItWorksItemsContainer>
        {HOW_WORKS_BUTTONS.map((button) => (
          <HowItWorksLink onClick={button.onClick} to="">
            {button.icon}
            {button.text}
          </HowItWorksLink>
        ))}
      </HowItWorksItemsContainer>
    </>
  );
}

export {UpsellingAboutSection};
