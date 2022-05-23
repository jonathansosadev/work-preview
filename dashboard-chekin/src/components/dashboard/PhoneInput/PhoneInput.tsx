import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import {compareTwoStrings} from 'string-similarity';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import {Country} from '../../../utils/types';
import {useOutsideClick} from '../../../utils/hooks';
import searchIcon from '../../../assets/search.svg';
import Loader from '../../common/Loader';
import Button from '../Button';
import {ErrorMessage} from '../../../styled/common';
import {
  CountryCodesContainer,
  DisplayIcon,
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
  StyledInput,
  FieldLabel,
  FieldsWrapper,
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

export type PhoneInputProps = {
  onChange?: (value: string, name?: string) => void;
  name?: string;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  defaultInputValue?: string;
  defaultCode?: string;
  placeholder?: string;
  error?: any;
  className?: string;
  value?: string | number | null; // NOTE: Use null to reset fields
  tabIndex?: number;
};

const PhoneInput = React.forwardRef<HTMLButtonElement, PhoneInputProps>(
  (
    {
      onChange,
      name,
      label,
      disabled,
      readOnly,
      defaultCode,
      defaultInputValue,
      placeholder,
      error,
      value,
      className,
      tabIndex,
    },
    ref,
  ) => {
    const {t} = useTranslation();
    const searchInputRef = React.useRef<any>(null);
    const wrapperRef = React.useRef<any>(null);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [queriedOptions, setQueriedOptions] = React.useState<CountryCodeOption[]>([]);
    const [selectedOption, setSelectedOption] = React.useState(DEFAULT_OPTION);
    const [inputValue, setInputValue] = React.useState(defaultInputValue || '');
    const {data: phoneCodes, refetch, status, error: phoneCodesError} = useQuery(
      ['phoneCodes', 'ordering=name&old_mode=1&phone_code=1'],
      ({queryKey}) => fetchPhoneCodes(queryKey[1]),
    );

    const phoneCodesOptions = React.useMemo(() => {
      if (!phoneCodes || phoneCodesError) {
        return [];
      }
      return getPhoneCodesAsOptions(phoneCodes);
    }, [phoneCodes, phoneCodesError]);

    React.useEffect(() => {
      if (value === null) {
        setInputValue('');
        setSelectedOption(DEFAULT_OPTION);
      }
    }, [value]);

    React.useEffect(() => {
      if (defaultCode && phoneCodesOptions?.length) {
        const option = phoneCodesOptions.find((c) => c?.code === defaultCode);
        option && setSelectedOption(option);
      }
    }, [defaultCode, phoneCodesOptions]);

    React.useEffect(() => {
      if (defaultInputValue) {
        setInputValue(defaultInputValue);
      }
    }, [defaultInputValue]);

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
      if (readOnly) return;
      setIsMenuOpen((prevState) => !prevState);
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
                {option.name} {option.code}
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
        <Wrapper className={className} tabIndex={tabIndex}>
          {status === 'loading' && (
            <LoaderWrapper>
              <Loader height={18} width={18} />
            </LoaderWrapper>
          )}
          {phoneCodesError && (
            <RequestErrorMessage>
              <Button label={t('failed_retry')} onClick={() => refetch()} />
            </RequestErrorMessage>
          )}
          <FieldLabel disabled={disabled}>{label}</FieldLabel>
          <FieldsWrapper>
            <span ref={wrapperRef}>
              <SelectedCountryCodeContainer
                onClick={toggleAreCountryCodesExpanded}
                disabled={disabled}
                readOnly={readOnly}
                error={error}
                type="button"
                ref={ref}
                empty={selectedOption.code === DEFAULT_OPTION.code}
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
                    inputMode="search"
                    ref={searchInputRef}
                  />
                  <SearchIcon src={searchIcon} alt="" />
                </InputRelativeWrapper>
                <Divider />
                <CountryCodesContainer>{renderOptions()}</CountryCodesContainer>
              </Menu>
            </span>
            <StyledInput
              onChange={handleInputChange}
              type="number"
              inputMode="tel"
              disabled={disabled}
              readOnly={readOnly}
              value={inputValue}
              placeholder={placeholder}
              error={error}
              empty={!inputValue}
            />
          </FieldsWrapper>
        </Wrapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </>
    );
  },
);

export {PhoneInput};
