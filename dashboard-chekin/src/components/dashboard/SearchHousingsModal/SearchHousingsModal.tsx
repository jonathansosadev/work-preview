import React from 'react';
import {useTranslation} from 'react-i18next';
import {SelectOption} from '../../../utils/types';
import searchHousingsIcon from '../../../assets/search-house.svg';
import api from '../../../api';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import QueriedInfiniteScrollSelect from '../QueriedInfiniteScrollSelect';
import {ButtonsWrapper, SelectWrapper, StyledKeyboardHint} from './styled';

type SearchHousingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: SelectOption) => void;
  submitButtonText?: string;
  strictOptions?: boolean;
  extraParams?: string;
};

const defaultProps: SearchHousingsModalProps = {
  open: false,
  onClose: () => {},
  onSubmit: () => {},
  submitButtonText: '',
  strictOptions: false,
  extraParams: '',
};

function SearchHousingsModal({
  open,
  onClose,
  onSubmit,
  submitButtonText,
  strictOptions,
  extraParams,
}: SearchHousingsModalProps) {
  const {t} = useTranslation();
  const [query, setQuery] = React.useState('');
  const [hasResults, setHasResults] = React.useState(false);
  const [value, setValue] = React.useState<SelectOption | null>(null);

  const isKeyboardHintVisible = Boolean(!strictOptions && hasResults && (query || value));

  const handleInputChange = (value = '') => {
    setQuery(value);
  };

  const handleClose = () => {
    onClose();
    setValue(null);
  };

  const handleSubmit = () => {
    if (value) {
      onSubmit(value);
      handleClose();
      setValue(null);
    }
  };

  const handleKeyDown = (event: any) => {
    if (strictOptions) {
      return;
    }

    if (event.key === 'Enter') {
      const submitValue = query || (value?.label as string) || '';

      onSubmit({
        value: submitValue,
        label: submitValue,
      });
      setValue(null);
      handleClose();
    }
  };

  const handleValueChange = (option: SelectOption) => {
    setValue(option);
  };

  const handleOptionsChange = (options: SelectOption[]) => {
    const hasOptions = Boolean(options?.length);
    setHasResults(hasOptions);
  };

  return (
    <Modal
      closeOnEscape
      closeOnDocumentClick
      open={open}
      onClose={onClose}
      title={t('search_by_property')}
      iconSrc={searchHousingsIcon}
      iconAlt="House magnifier"
      iconProps={{
        height: 84,
        width: 84,
      }}
    >
      <SelectWrapper>
        <QueriedInfiniteScrollSelect
          autoFocus
          fetcher={(key, page, number) =>
            api.housings.fetchPaginatedList(
              key,
              page,
              number,
              `available=1&ordering=name&${extraParams}`,
            )
          }
          queryKey="paginatedSearchHousings"
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t('enter_property_name')}
          value={value}
          onChange={handleValueChange}
          onOptionsChange={handleOptionsChange}
          blockQuery={!open}
        />
        <StyledKeyboardHint visible={isKeyboardHintVisible}>
          {t('press_enter')}
        </StyledKeyboardHint>
      </SelectWrapper>
      <ButtonsWrapper>
        <ModalButton
          disabled={!value}
          onClick={handleSubmit}
          label={submitButtonText || t('search')}
        />
        <ModalButton secondary onClick={handleClose} label={t('close')} />
      </ButtonsWrapper>
    </Modal>
  );
}

SearchHousingsModal.defaultProps = defaultProps;
export {SearchHousingsModal};
