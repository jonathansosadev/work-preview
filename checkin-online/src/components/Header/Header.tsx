import React from 'react';
import {useTranslation} from 'react-i18next';
import {breakIntoLines} from '../../utils/translations';
import {useReservation} from '../../context/reservation';
import {getHousingPicture} from '../../utils/reservation';
import {useModalControls} from '../../utils/hooks';
import {LanguageOption} from '../../utils/types';
import {CHANGE_LANGUAGE_TRIGGER_ID} from '../../utils/constants';
// import chekinLogo from '../../assets/logo-chekin-white.svg';
import chekinLogo from '../../assets/chekin-imago-white.svg';
import backIconBlue from '../../assets/back-icn-white.svg';
import britishFlag from '../../assets/british.svg';
import spanishFlag from '../../assets/spain.svg';
import italianFlag from '../../assets/italy.svg';
import germanyFlag from '../../assets/germany.svg';
import frenchFlag from '../../assets/france.svg';
import hungarianFlag from '../../assets/hungary.svg';
import russianFlag from '../../assets/russia.svg';
import czechFlag from '../../assets/czech.svg';
import bulgarianFlag from '../../assets/bulgarian-flag-icon.svg';
import portugueseFlag from '../../assets/portuguese-flag-icon.svg';
import estonianFlag from '../../assets/estonian-flag-icon.svg';
import romanianFlag from '../../assets/romanian-flag-icon.svg';
import ResizeObserver from 'resize-observer-polyfill';
import BackButton from '../BackButton';
import LanguageMenu from '../LanguageMenu';
import {
  ChekinLogo,
  HeaderContainer,
  HeaderTitle,
  HeaderTitleWrapper,
  MobileHeaderIconContainer,
  StepsContainer,
  MobileLanguageButton,
  BackButtonWrapper,
  MobileBackButton,
  HeaderContent,
  HeaderMargin,
  HeaderSubtitle,
  LanguageButton,
} from './styled';

type HeaderProps = {
  children?: React.ReactNode | JSX.Element | null;
  title?: string;
  hideLogo?: boolean;
  steps?: number | string;
  activeStep?: number | string;
  subtitle?: string;
  className?: string;
  MobileHeaderIcon?: React.ReactNode | JSX.Element | null;
  backButtonLabel?: string;
  onBack?: () => void;
  backButtonDisabled?: boolean;
  hideBackButton?: boolean;
};

const defaultProps: HeaderProps = {
  title: '',
  hideLogo: false,
  subtitle: '',
  MobileHeaderIcon: null,
  className: undefined,
  children: null,
  steps: '',
  activeStep: '',
  backButtonLabel: '',
  backButtonDisabled: false,
  onBack: () => {},
  hideBackButton: false,
};

function Header({
  children,
  title,
  hideLogo,
  steps,
  activeStep,
  subtitle,
  MobileHeaderIcon,
  className,
  backButtonLabel,
  onBack,
  backButtonDisabled,
  hideBackButton,
}: HeaderProps) {
  const {t, i18n} = useTranslation();
  const {data} = useReservation();
  const observerRef = React.useRef<ResizeObserver>();
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const languageOptions = React.useMemo<LanguageOption[]>(() => {
    return [
      {
        value: 'en',
        label: 'English',
        icon: britishFlag,
      },
      {
        value: 'es',
        label: 'Español',
        icon: spanishFlag,
      },
      {
        value: 'it',
        label: 'Italiano',
        icon: italianFlag,
      },
      {
        value: 'de',
        label: 'Deutsch',
        icon: germanyFlag,
      },
      {
        value: 'fr',
        label: 'Français',
        icon: frenchFlag,
      },
      {
        value: 'hu',
        label: 'Magyar',
        icon: hungarianFlag,
      },
      {
        value: 'ru',
        label: 'Русский',
        icon: russianFlag,
      },
      {
        value: 'cs',
        label: 'Čeština',
        icon: czechFlag,
      },
      {
        value: 'bg',
        label: 'Български',
        icon: bulgarianFlag,
      },
      {
        value: 'pt',
        label: 'Português',
        icon: portugueseFlag,
      },
      {
        value: 'ro',
        label: 'Română',
        icon: romanianFlag,
      },
      {
        value: 'ee',
        label: 'Eestlane',
        icon: estonianFlag,
      },
    ];
  }, []);
  const [headerHeight, setHeaderHeight] = React.useState<number | null>(null);
  const [activeLanguageOption, setActiveLanguageOption] = React.useState(
    languageOptions[0],
  );

  const {
    closeModal: closeLanguageMenu,
    isOpen: isLanguageMenuOpen,
    setIsOpen: setIsLanguageMenuOpen,
  } = useModalControls();
  const {
    closeModal: closeMobileLanguageMenu,
    isOpen: isMobileLanguageMenuOpen,
    setIsOpen: setIsMobileLanguageMenuOpen,
  } = useModalControls();

  const hasSteps = steps && activeStep;
  const hasCustomLogo = Boolean(getHousingPicture(data));

  React.useLayoutEffect(() => {
    observerRef.current = new ResizeObserver(([entry]) => {
      window.requestAnimationFrame(() => {
        setHeaderHeight(entry.contentRect.height);
      });
    });

    if (headerRef.current) {
      observerRef.current.observe(headerRef.current);
    }
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  React.useLayoutEffect(
    function updateLanguageOption() {
      const nextOption = languageOptions.find(option => {
        return option.value === i18n.language.slice(0, 2);
      });

      if (nextOption) {
        setActiveLanguageOption(nextOption);
      }
    },
    [languageOptions, i18n.language],
  );

  const toggleIsLanguageMenuOpen = () => {
    setIsLanguageMenuOpen(prevState => {
      return !prevState;
    });
  };

  const toggleIsMobileLanguageMenuOpen = () => {
    setIsMobileLanguageMenuOpen(prevState => {
      return !prevState;
    });
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  if (children) {
    return (
      <>
        <HeaderMargin height={headerHeight} />
        <HeaderContainer className={className} ref={headerRef}>
          {!hasCustomLogo && !hideLogo && <ChekinLogo src={chekinLogo} alt="Checkin" />}
          {children}
        </HeaderContainer>
      </>
    );
  }

  return (
    <>
      <HeaderMargin height={headerHeight} />
      <HeaderContainer className={className} ref={headerRef}>
        <HeaderContent>
          {!hasCustomLogo && !hideLogo && <ChekinLogo src={chekinLogo} alt="Checkin" />}
          {hideBackButton ? (
            <MobileHeaderIconContainer>{MobileHeaderIcon}</MobileHeaderIconContainer>
          ) : (
            <MobileHeaderIconContainer>
              <MobileBackButton onClick={onBack}>
                <img src={backIconBlue} alt="Arrow" />
              </MobileBackButton>
            </MobileHeaderIconContainer>
          )}
          {!hideBackButton && (
            <BackButtonWrapper>
              <BackButton
                label={backButtonLabel || t('back')}
                onClick={onBack}
                disabled={backButtonDisabled}
              />
            </BackButtonWrapper>
          )}
          <HeaderTitleWrapper>
            <LanguageButton onClick={toggleIsLanguageMenuOpen}>
              <img
                id={CHANGE_LANGUAGE_TRIGGER_ID}
                src={activeLanguageOption.icon}
                alt="Country flag"
              />
              <LanguageMenu
                activeOption={activeLanguageOption}
                open={isLanguageMenuOpen}
                onClose={closeLanguageMenu}
                onLanguageChange={changeLanguage}
                languageOptions={languageOptions}
              />
            </LanguageButton>
            {title && (
              <HeaderTitle centerContent={!Boolean(subtitle)}>
                {breakIntoLines(title)}{' '}
                {hasSteps && (
                  <StepsContainer data-testid="steps">
                    ({activeStep}/{steps})
                  </StepsContainer>
                )}
              </HeaderTitle>
            )}
            {subtitle && <HeaderSubtitle>{subtitle}</HeaderSubtitle>}
          </HeaderTitleWrapper>
          <MobileLanguageButton onClick={toggleIsMobileLanguageMenuOpen}>
            <img
              id={CHANGE_LANGUAGE_TRIGGER_ID}
              src={activeLanguageOption.icon}
              alt="Country flag"
            />
            <LanguageMenu
              activeOption={activeLanguageOption}
              open={isMobileLanguageMenuOpen}
              onClose={closeMobileLanguageMenu}
              onLanguageChange={changeLanguage}
              languageOptions={languageOptions}
            />
          </MobileLanguageButton>
        </HeaderContent>
      </HeaderContainer>
    </>
  );
}

Header.defaultProps = defaultProps;
export {Header};
