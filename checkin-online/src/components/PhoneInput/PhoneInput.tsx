import React from 'react';
import useSWR from 'swr';
import {useTranslation} from 'react-i18next';
import {compareTwoStrings} from 'string-similarity';
import api, {getURL} from '../../api';
import {Country} from '../../utils/types';
import {useErrorModal, useOutsideClick} from '../../utils/hooks';
import {ErrorMessage} from '../../styled/common';
import searchIcon from '../../assets/search.svg';
import Input from '../Input';
import Button from '../Button';
import Loader from '../Loader';
import {
  CountryCodesContainer,
  Divider,
  RequestErrorMessage,
  InputRelativeWrapper,
  LoaderWrapper,
  Menu,
  Option,
  SearchIcon,
  SearchInput,
  SelectedCountryCodeContainer,
  Wrapper,
  OptionWrapper,
  EmptyOption,
  DisplayIcon,
} from './styled';

const DEFAULT_OPTION = {
  code: '- -',
  name: '',
};

type CountryCodeOption = {
  name: string;
  code: string;
};

type LocationPhoneCode = {
  country: Country;
  phone_code: number;
};

function getPhoneCodesAsOptions(locations: LocationPhoneCode[] = []) {
  if (!locations || !Array.isArray(locations)) {
    return [];
  }

  return locations?.map(location => {
    return {
      name: location?.country?.name,
      code: `+${location.phone_code}`,
    };
  });
}

export type PhoneInputProps = {
  onChange?: (value: string, name?: string) => void;
  name?: string;
  label?: string;
  disabled?: boolean;
  defaultInputValue?: string;
  defaultCode?: string;
  placeholder?: string;
  error?: string;
};

export const defaultProps: PhoneInputProps = {
  onChange: () => {},
  name: '',
  defaultInputValue: '',
  defaultCode: '',
  placeholder: '',
  disabled: false,
  error: '',
};

function PhoneInput({
  onChange,
  name,
  label,
  disabled,
  defaultCode,
  defaultInputValue,
  placeholder,
  error,
}: PhoneInputProps) {
  const {t} = useTranslation();
  const searchInputRef = React.useRef<any>(null);
  const wrapperRef = React.useRef<any>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [queriedOptions, setQueriedOptions] = React.useState<CountryCodeOption[]>([]);
  const [selectedOption, setSelectedOption] = React.useState(DEFAULT_OPTION);
  const [inputValue, setInputValue] = React.useState(defaultInputValue || '');
  const {ErrorModal, displayError} = useErrorModal();
  const {data: phoneCodes, isValidating, mutate, error: phoneCodesError} = useSWR(
    getURL(api.locations.ENDPOINTS.get('ordering=name&old_mode=1&phone_code=1')),
  );

  React.useEffect(() => {
    if (phoneCodesError) {
      displayError(phoneCodesError);
    }
  }, [phoneCodesError, displayError]);

  const phoneCodesOptions = React.useMemo(() => {
    if (!phoneCodes) {
      return [];
    }
    return getPhoneCodesAsOptions(phoneCodes);
  }, [phoneCodes]);

  React.useEffect(() => {
    if (defaultCode && phoneCodesOptions?.length) {
      const option = phoneCodesOptions.find(c => c?.code === defaultCode);
      option && setSelectedOption(option);
    }
  }, [defaultCode, phoneCodesOptions]);

  React.useEffect(() => {
    if (isMenuOpen) {
      searchInputRef.current?.focus();
    } else {
      setSearchQuery('');
    }
  }, [isMenuOpen]);

  const closeMenu = React.useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  useOutsideClick(wrapperRef, closeMenu);

  const toggleAreCountryCodesExpanded = () => {
    setIsMenuOpen(prevState => !prevState);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {target} = event;

    setSearchQuery(target.value);
    getAndSetQueriedOptions(target.value);
  };

  const handleCountryCodeChange = React.useCallback(
    (option: CountryCodeOption) => {
      setSelectedOption(option);
      setIsMenuOpen(false);

      if (!inputValue) {
        onChange!('', name);
        return;
      }

      const nextValue = `${option.code}${inputValue}`;
      onChange!(nextValue, name);
    },
    [inputValue, name, onChange],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {target} = event;
    setInputValue(target.value);

    if (!target.value || selectedOption.code === DEFAULT_OPTION.code) {
      onChange!('', name);
      return;
    }

    const nextValue = `${selectedOption.code}${target.value}`;
    onChange!(nextValue, name);
  };

  const getQueriedOptions = (query = '') => {
    return phoneCodesOptions
      .filter((option: CountryCodeOption) => {
        return (
          option.name.toLowerCase().startsWith(query.toLowerCase()) ||
          option.code?.includes(query.toLowerCase())
        );
      })
      .sort((a, b) => {
        const comparingValue: 'name' | 'code' = a.name
          .toLowerCase()
          .startsWith(query.toLowerCase())
          ? 'name'
          : 'code';

        const firstSimilarity = compareTwoStrings(query, a[comparingValue]);
        const secondSimilarity = compareTwoStrings(query, b[comparingValue]);

        if (firstSimilarity > secondSimilarity) {
          return -1;
        }

        if (firstSimilarity < secondSimilarity) {
          return 1;
        }

        return 0;
      });
  };

  const getAndSetQueriedOptions = (query = '') => {
    const nextQueriedOptions = getQueriedOptions(query);
    setQueriedOptions(nextQueriedOptions);
  };

  const renderMenuOptions = React.useCallback(
    (options: CountryCodeOption[] = []) => {
      return options.map((option: CountryCodeOption, index) => {
        const isSelected = option.code === selectedOption.code;
        return (
          <OptionWrapper onClick={() => handleCountryCodeChange(option)} key={index}>
            <Option selected={isSelected}>
              {option?.name} {option?.code}
            </Option>
          </OptionWrapper>
        );
      });
    },
    [handleCountryCodeChange, selectedOption.code],
  );

  const renderOptions = React.useCallback(() => {
    if (searchQuery) {
      if (queriedOptions.length) {
        return renderMenuOptions(queriedOptions);
      }
      return <EmptyOption>{t('no_results')}</EmptyOption>;
    }

    return renderMenuOptions(phoneCodesOptions);
  }, [phoneCodesOptions, queriedOptions, searchQuery, renderMenuOptions, t]);

  return (
    <>
      <ErrorModal />
      <Wrapper error={error}>
        {isValidating && (
          <LoaderWrapper>
            <Loader height={18} width={18} />
          </LoaderWrapper>
        )}
        {phoneCodesError && (
          <RequestErrorMessage>
            <Button label={t('failed_retry')} onClick={mutate} />
          </RequestErrorMessage>
        )}
        <span ref={wrapperRef}>
          <SelectedCountryCodeContainer
            onClick={toggleAreCountryCodesExpanded}
            disabled={disabled}
            isEmpty={selectedOption.code === DEFAULT_OPTION.code}
            error={error}
            type="button"
          >
            {selectedOption.code}
            <DisplayIcon shouldRotate={isMenuOpen} />
          </SelectedCountryCodeContainer>
          <Menu open={isMenuOpen}>
            <InputRelativeWrapper>
              <SearchInput
                onChange={handleSearchInputChange}
                value={searchQuery}
                placeholder={t('search')}
                ref={searchInputRef}
              />
              <SearchIcon src={searchIcon} alt="Magnifier" />
            </InputRelativeWrapper>
            <Divider />
            <CountryCodesContainer>{renderOptions()}</CountryCodesContainer>
          </Menu>
        </span>
        <Input
          onChange={handleInputChange}
          type="number"
          label={label}
          disabled={disabled}
          value={inputValue}
          placeholder={placeholder}
          hideNumberButtons={true}
          aria-label={name}
        />
      </Wrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
}

PhoneInput.defaultProps = defaultProps;
export {PhoneInput};
