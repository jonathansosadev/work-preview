import React from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'react-router-dom';
import {LinkOption} from '../../../utils/types';
import {useOutsideClick} from '../../../utils/hooks';
import searchIcon from '../../../assets/magnifier_light_blue.svg';
import {
  Divider,
  Menu,
  Option,
  RelativeWrapper,
  TriggerButton,
  SearchInput,
  SearchIcon,
  InputRelativeWrapper,
  StyledLink,
  EmptyOption,
  MenuItems,
} from './styled';

const TRIGGER_BUTTON_ID = 'trigger-id';

function renderMenuOptions(options: Array<LinkOption> = [], location: any) {
  return options.map((option: LinkOption, index) => {
    const isLastOption = index === options.length - 1;

    return (
      <div key={index}>
        <Option>
          <StyledLink to={{...location, ...option.link}}>{option.label}</StyledLink>
        </Option>
        {!isLastOption && <Divider />}
      </div>
    );
  });
}

function renderEmptyMenuOption(message = '') {
  return <EmptyOption>{message}</EmptyOption>;
}

type RegisterButtonSearchMenuProps = {
  options: Array<LinkOption>;
};

const defaultProps: RegisterButtonSearchMenuProps = {
  options: [],
};

function RegisterButtonSearchMenu({options}: RegisterButtonSearchMenuProps) {
  const {t} = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [queriedOptions, setQueriedOptions] = React.useState<Array<LinkOption>>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isMenuOpen) {
      searchInputRef?.current?.focus();
    }
  }, [isMenuOpen]);

  const handleMenuOutsideClick = React.useCallback((event: React.MouseEvent) => {
    if ((event as any)?.target?.id === TRIGGER_BUTTON_ID) {
      return;
    }
    setIsMenuOpen(false);
  }, []);
  useOutsideClick(searchMenuRef, handleMenuOutsideClick);

  const toggleIsMenuOpen = () => {
    setIsMenuOpen((prevState) => {
      return !prevState;
    });
  };

  const getQueriedOptions = (query = '') => {
    return options.filter((option) => {
      return option.label?.toLowerCase().includes(query.toLowerCase());
    });
  };

  const getAndSetQueriedOptions = (query = '') => {
    const nextQueriedOptions = getQueriedOptions(query);
    setQueriedOptions(nextQueriedOptions);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;

    setSearchQuery(value);
    getAndSetQueriedOptions(value);
  };

  const renderOptions = () => {
    if (searchQuery) {
      if (queriedOptions.length) {
        return renderMenuOptions(queriedOptions, location);
      }
      return renderEmptyMenuOption(t('no_results'));
    }
    return renderMenuOptions(options, location);
  };

  return (
    <RelativeWrapper>
      <TriggerButton
        id={TRIGGER_BUTTON_ID}
        active={isMenuOpen}
        onClick={toggleIsMenuOpen}
      >
        {t('change_logo')}
      </TriggerButton>
      {isMenuOpen && (
        <Menu ref={searchMenuRef}>
          <InputRelativeWrapper>
            <SearchInput
              ref={searchInputRef}
              onChange={handleSearchInputChange}
              value={searchQuery}
              placeholder={t('search')}
            />
            <SearchIcon src={searchIcon} alt="Magnifier" />
          </InputRelativeWrapper>
          <Divider />
          <MenuItems>{renderOptions()}</MenuItems>
        </Menu>
      )}
    </RelativeWrapper>
  );
}

RegisterButtonSearchMenu.defaultProps = defaultProps;
export {RegisterButtonSearchMenu};
