import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import {compareTwoStrings} from 'string-similarity';
import api, {queryFetcher, getAnonymousHeaders} from '../../../api';
import type {Country, InputEventType} from '../../../utils/types';
import {useOutsideClick} from '../../../utils/hooks';
import displayIcon from '../../../assets/display-icn-darken.svg';
import searchIcon from '../../../assets/search.svg';
import Input from '../Input';
import Loader from '../../common/Loader';
import Button from '../Button';
import {
  CountryCodesContainer,
  DisplayIcon,
  Divider,
  ErrorWrapper,
  InputRelativeWrapper,
  LoaderWrapper,
  Menu,
  Option,
  SearchIcon,
  SearchInput,
  SelectedCountryCodeContainer,
  Wrapper,
  EmptyOption,
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
  if (!locations) {
    return [];
  }

  return locations?.map((location) => {
    return {
      name: location.country.name,
      code: `+${location.phone_code}`,
    };
  });
}

function fetchPhoneCodes(params = '') {
  return queryFetcher(api.locations.ENDPOINTS.all(params), {
    headers: getAnonymousHeaders(),
  });
}

type PhoneInputProps = {
  onChange?: (value: string, name?: string) => void;
  name?: string;
  label?: string;
  disabled?: boolean;
  defaultInputValue?: string;
  defaultCode?: string;
  placeholder?: string;
  choosenCountry?: string;
};

export const defaultProps: PhoneInputProps = {
  onChange: () => {},
  name: '',
  defaultInputValue: '',
  defaultCode: '',
  disabled: false,
  placeholder: '',
  choosenCountry: '',
};

function PhoneInput({
  onChange,
  name,
  label,
  disabled,
  defaultCode,
  defaultInputValue,
  placeholder,
  choosenCountry,
}: PhoneInputProps) {
  const {t} = useTranslation();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLSpanElement>(null);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(defaultInputValue || '');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [queriedPhoneCodesOptions, setQueriedPhoneCodesOptions] = React.useState<
    CountryCodeOption[]
  >([]);
  const [selectedPhoneCodeOption, setSelectedPhoneCodeOption] = React.useState<
    CountryCodeOption
  >(DEFAULT_OPTION);

  const {data: phoneCodes, refetch, status: phoneCodesStatus, error} = useQuery<
    LocationPhoneCode[],
    [string, string]
  >(['phoneCodes', 'ordering=name&old_mode=1&phone_code=1'], ({queryKey}) =>
    fetchPhoneCodes(queryKey[1]),
  );

  const phoneCodesOptions = React.useMemo(() => {
    if (!phoneCodes || error) {
      return [];
    }
    return getPhoneCodesAsOptions(phoneCodes);
  }, [phoneCodes, error]);

  React.useEffect(
    function setPhoneCodeBasedOnCountry() {
      if (choosenCountry && phoneCodes) {
        const option = getPhoneCodesAsOptions(phoneCodes).find(
          (c) => c.name === choosenCountry,
        );

        if (option) {
          setSelectedPhoneCodeOption(option);
        }
      }
    },
    [choosenCountry, phoneCodes],
  );

  React.useEffect(() => {
    if (defaultCode && phoneCodes) {
      const option = getPhoneCodesAsOptions(phoneCodes).find(
        (c) => c?.code === defaultCode,
      );

      if (option) {
        setSelectedPhoneCodeOption(option);
      }
    }
  }, [defaultCode, phoneCodes]);

  const handleClickOutside = React.useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  useOutsideClick(wrapperRef, handleClickOutside);

  React.useEffect(() => {
    if (isMenuOpen) {
      searchInputRef.current?.focus();
    } else {
      setSearchQuery('');
    }
  }, [isMenuOpen]);

  const toggleAreCountryCodesExpanded = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  const getQueriedOptions = (query = '') => {
    return phoneCodesOptions
      .filter((option) => {
        return (
          option.name.toLowerCase().startsWith(query.toLowerCase()) ||
          option.code.includes(query.toLowerCase())
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
    setQueriedPhoneCodesOptions(nextQueriedOptions);
  };

  const handleSearchInputChange = (event: InputEventType) => {
    const {value} = event.target;

    setSearchQuery(value);
    getAndSetQueriedOptions(value);
  };

  const handleCountryCodeChange = React.useCallback(
    (option: CountryCodeOption) => {
      setSelectedPhoneCodeOption(option);
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

  const handleInputChange = React.useCallback(
    (event: InputEventType) => {
      const {value} = event.target;
      setInputValue(value);

      if (!value || selectedPhoneCodeOption.code === DEFAULT_OPTION.code) {
        onChange!('', name);
        return;
      }

      const nextValue = `${selectedPhoneCodeOption.code}${value}`;
      onChange!(nextValue, name);
    },
    [name, onChange, selectedPhoneCodeOption.code],
  );

  const renderMenuOptions = React.useCallback(
    (options: CountryCodeOption[]) => {
      return options.map((option, index) => {
        const isSelected = option.code === selectedPhoneCodeOption.code;
        const isLastOption = index === options.length - 1;

        return (
          <div onClick={() => handleCountryCodeChange(option)} key={index}>
            <Option selected={isSelected}>
              {option.name} {option.code}
            </Option>
            {!isLastOption && <Divider />}
          </div>
        );
      });
    },
    [handleCountryCodeChange, selectedPhoneCodeOption.code],
  );

  const renderOptions = React.useCallback(() => {
    if (searchQuery) {
      if (queriedPhoneCodesOptions.length) {
        return renderMenuOptions(queriedPhoneCodesOptions);
      }
      return <EmptyOption>{t('no_results')}</EmptyOption>;
    }

    return renderMenuOptions(phoneCodesOptions);
  }, [phoneCodesOptions, queriedPhoneCodesOptions, renderMenuOptions, searchQuery, t]);

  return (
    <Wrapper>
      {phoneCodesStatus === 'loading' && (
        <LoaderWrapper>
          <Loader height={18} width={18} />
        </LoaderWrapper>
      )}
      {phoneCodesStatus === 'error' && (
        <ErrorWrapper>
          <Button
            danger
            label={t('request_failed_retry')}
            onClick={() => refetch()}
            size="tiny"
          />
        </ErrorWrapper>
      )}
      <span ref={wrapperRef}>
        <SelectedCountryCodeContainer onClick={toggleAreCountryCodesExpanded}>
          {selectedPhoneCodeOption.code}
          <DisplayIcon expanded={isMenuOpen} src={displayIcon} alt="Arrow" />
        </SelectedCountryCodeContainer>
        <Menu open={isMenuOpen}>
          <InputRelativeWrapper>
            <SearchInput
              onChange={handleSearchInputChange}
              value={searchQuery}
              placeholder={t('search')}
              ref={searchInputRef}
              inputMode="search"
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
        inputMode="tel"
        value={inputValue}
        placeholder={placeholder}
        label={label}
        disabled={disabled}
      />
    </Wrapper>
  );
}

export {PhoneInput};
