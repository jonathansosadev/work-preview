import React from 'react';
import {useTranslation} from 'react-i18next';
import searchIcon from '../../../assets/base_blue_search_icon.svg';
import {InputEventType} from '../../../utils/types';
import Modal, {SelectCheckboxesModalStyles} from '../Modal';
import HousingsSelectCheckboxes from '../HousingsSelectCheckboxes';
import {
  CancelButton,
  SubmitButton,
  SearchInput,
  InputWrapper,
  SearchIcon,
  SelectPropsModalContent,
  OrSelectText,
} from './styled';

const searchHousings = (housings: {value: string; label: string}[], filter: string) => {
  return housings.filter(({label}) =>
    label.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
  );
};

type SelectPropsModalProps = {
  open: boolean | undefined;
  onClose: () => void;
  housingsOptions: {value: string; label: string}[];
  toggleIsChecked: (id: string) => void;
  toggleSelectAll: () => void;
  checkboxes: {};
  isAllChecked: boolean;
  isLoading: boolean;
  onExport: any;
  confirmBtnLabel?: string;
};

function SelectPropsModal({
  open,
  onClose,
  housingsOptions,
  toggleIsChecked,
  toggleSelectAll,
  checkboxes,
  isAllChecked,
  isLoading,
  onExport,
  confirmBtnLabel,
}: SelectPropsModalProps) {
  const {t} = useTranslation();
  const [searchPropsInputValue, setSearchPropsInputValue] = React.useState('');

  const handlePropsInputChange = (e: InputEventType) => {
    setSearchPropsInputValue(e.target.value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnDocumentClick
      closeOnEscape
      title={t('select_properties')}
      contentStyle={SelectCheckboxesModalStyles}
    >
      <SelectPropsModalContent>
        <InputWrapper>
          <SearchIcon src={searchIcon} alt="Magnifier" />
          <SearchInput
            onChange={handlePropsInputChange}
            value={searchPropsInputValue}
            placeholder={t('select_your_property')}
          />
        </InputWrapper>
        <OrSelectText>{t('or_select')}:</OrSelectText>
        <HousingsSelectCheckboxes
          allCheckboxLabel={t('all_properties')}
          housingsOptions={searchHousings(housingsOptions, searchPropsInputValue)}
          toggleIsChecked={toggleIsChecked}
          toggleSelectAll={toggleSelectAll}
          checkboxes={checkboxes}
          isAllChecked={isAllChecked}
          isLoading={isLoading}
        />
      </SelectPropsModalContent>
      <SubmitButton onClick={onExport} label={confirmBtnLabel || t('select')} />
      <CancelButton secondary onClick={onClose} label={t('cancel')} />
    </Modal>
  );
}

export {SelectPropsModal};
