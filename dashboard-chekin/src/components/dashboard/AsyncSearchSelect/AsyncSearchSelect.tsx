import React from 'react';
import AsyncSelect from 'react-select/async';
import {useTranslation} from 'react-i18next';
import {SelectOption} from '../../../utils/types';
import {Wrapper, KeyboardHint} from './styled';

type AsyncSearchSelectProps = {
  loadOptions: (value: any, callback: any) => void;
  onChange?: (option: SelectOption) => void;
  onInputChange?: (value: string) => void;
  onKeyDown: (event: React.SyntheticEvent<HTMLElement>) => void;
  value?: SelectOption | null;
  placeholder?: string;
  cacheOptions?: boolean;
  defaultValues?: [] | boolean;
  loading?: boolean;
  className?: string;
  hasResults?: boolean;
  autoFocus?: boolean;
  strictOptions?: boolean;
};

const defaultProps: AsyncSearchSelectProps = {
  onChange: () => {},
  loadOptions: () => {},
  onInputChange: () => {},
  onKeyDown: () => {},
  value: null,
  placeholder: '- -',
  cacheOptions: true,
  defaultValues: false,
  loading: false,
  className: undefined,
  hasResults: false,
  autoFocus: true,
  strictOptions: false,
};

function AsyncSearchSelect({
  loadOptions,
  cacheOptions,
  defaultValues,
  onChange,
  placeholder,
  value,
  loading,
  onInputChange,
  className,
  hasResults,
  autoFocus,
  onKeyDown,
  strictOptions,
}: AsyncSearchSelectProps) {
  const {t} = useTranslation();
  const ref = React.useRef<any>();
  const [hasQuery, setHasQuery] = React.useState(false);
  const [isQueryCached, setIsQueryCached] = React.useState(false);
  const canSelect = hasQuery && !loading && (hasResults || isQueryCached);

  const handleInputChange = (value: string) => {
    const isValueCached = Boolean(ref.current.state.optionsCache[value]?.length);
    setIsQueryCached(isValueCached);

    setHasQuery(Boolean(value));
    onInputChange!(value);
  };

  const handleChange = (option: any) => {
    onChange!(option);
  };

  const handleKeyDown = (event: React.SyntheticEvent<HTMLElement>) => {
    if (canSelect) {
      onKeyDown(event);
    }
  };

  return (
    <Wrapper selectable={canSelect} className={className}>
      <AsyncSelect
        ref={ref}
        onKeyDown={handleKeyDown}
        menuIsOpen={hasQuery}
        className="select"
        classNamePrefix="select"
        loadOptions={loadOptions}
        noOptionsMessage={() => t('nothing_found')}
        cacheOptions={cacheOptions}
        defaultValues={defaultValues}
        onChange={handleChange}
        value={value}
        placeholder={placeholder}
        onInputChange={handleInputChange}
        autoFocus={autoFocus}
      />
      <KeyboardHint visible={!strictOptions && canSelect}>
        {t('press_enter')}
      </KeyboardHint>
    </Wrapper>
  );
}

AsyncSearchSelect.defaultProps = defaultProps;
export {AsyncSearchSelect};
