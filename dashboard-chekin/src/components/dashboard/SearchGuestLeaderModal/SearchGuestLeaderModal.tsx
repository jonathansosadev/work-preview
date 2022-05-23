import React from 'react';
import {useTranslation} from 'react-i18next';
import {SelectOption} from '../../../utils/types';
import QueriedInfiniteScrollSelect from '../QueriedInfiniteScrollSelect';
import searchGuestIcon from '../../../assets/icon-search-guest.svg';
import api from '../../../api';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {RelativeWrapper} from '../../../styled/common';
import {ButtonsWrapper, StyledKeyboardHint, SelectWrapper} from './styled';

const PAGE_SIZE = 10;

type SearchHousingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: SelectOption) => void;
};

const defaultProps: SearchHousingsModalProps = {
  open: false,
  onClose: () => {},
  onSubmit: () => {},
};

function SearchGuestLeaderModal({open, onClose, onSubmit}: SearchHousingsModalProps) {
  const {t} = useTranslation();
  const [query, setQuery] = React.useState('');
  const [value, setValue] = React.useState<SelectOption | null>(null);
  const [hasResults, setHasResults] = React.useState(false);

  const isKeyboardHintVisible = Boolean(hasResults && (query || value));

  const handleClose = () => {
    onClose();
    setValue(null);
  };

  const handleInputChange = (value = '') => {
    setQuery(value);
  };

  const handleSubmit = () => {
    if (value) {
      onSubmit(value);
      handleClose();
    }
  };

  const handleKeyDown = (event: any) => {
    if (!hasResults) {
      return;
    }

    if (event.key === 'Enter') {
      const submitValue = query || value?.value || '';

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
      onClose={handleClose}
      title={t('search_by_guest_leader')}
      iconSrc={searchGuestIcon}
      iconAlt=""
      iconProps={{
        height: 84,
        width: 84,
      }}
    >
      <RelativeWrapper>
        <SelectWrapper>
          <QueriedInfiniteScrollSelect
            autoFocus
            queryKey="guestLeaders"
            placeholder={t('enter_guest_name')}
            fetcher={(key, page, searchQuery) => {
              const searchParam = searchQuery || value?.value || '';
              const params = `name=${searchParam}&page=${page}&page_size=${PAGE_SIZE}`;

              return api.guests.fetchGuestLeaders(key, params);
            }}
            blockQuery={!open}
            onChange={handleValueChange}
            value={value}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onOptionsChange={handleOptionsChange}
          />
        </SelectWrapper>
        <StyledKeyboardHint visible={Boolean(isKeyboardHintVisible)}>
          {t('press_enter')}
        </StyledKeyboardHint>
      </RelativeWrapper>
      <ButtonsWrapper>
        <ModalButton disabled={!value} onClick={handleSubmit} label={t('search')} />
        <ModalButton secondary onClick={handleClose} label={t('close')} />
      </ButtonsWrapper>
    </Modal>
  );
}

SearchGuestLeaderModal.defaultProps = defaultProps;
export {SearchGuestLeaderModal};
