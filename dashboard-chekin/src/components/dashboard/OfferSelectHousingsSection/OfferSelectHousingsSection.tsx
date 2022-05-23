import React from 'react';
import {useTranslation} from 'react-i18next';
import {useFormContext, useWatch} from 'react-hook-form';
import {SelectOption} from '../../../utils/types';
import {useModalControls} from '../../../utils/hooks';
import {FORM_NAMES} from '../../../utils/upselling';
import {FormTypes} from '../OfferDetails/types';
import Section from '../Section';
import Button from '../Button';
import SelectPropsModal from '../SelectPropsModal';
import {useHousingsSelectCheckboxes} from '../HousingsSelectCheckboxes';
import {ErrorMessage} from '../../../styled/common';
import {
  Counter,
  SelectedPropsContainer,
  SelectedPropItem,
  SelectedPropText,
  TinyDeleteBtn,
  SelectButtonWrapper,
} from './styled';

type OfferSelectHousingsSectionProps = {
  isLoadingHousingOptions: boolean;
  housingOptions: SelectOption[];
  disabled?: boolean;
};

function OfferSelectHousingsSection({
  disabled,
  housingOptions,
  isLoadingHousingOptions,
}: OfferSelectHousingsSectionProps) {
  const {t} = useTranslation();
  const {
    isOpen: isSelectPropsModalOpen,
    openModal: openSelectPropsModal,
    closeModal: closeSelectPropsModal,
  } = useModalControls();
  const {
    setValue,
    formState: {errors},
    control,
  } = useFormContext<FormTypes>();

  const selectedHousings = useWatch({name: FORM_NAMES.selectedHousings, control});

  const {
    isAllChecked,
    toggleSelectAll,
    checkboxes,
    toggleIsChecked,
    getSelectedHousingsCheckboxes,
  } = useHousingsSelectCheckboxes(
    housingOptions,
    selectedHousings?.map((elem) => elem.value),
  );

  const saveSelectedHousings = () => {
    const nextSelectedHousings = getSelectedHousingsCheckboxes(
      housingOptions,
      checkboxes,
    );

    setValue(FORM_NAMES.selectedHousings, nextSelectedHousings, {
      shouldDirty: true,
      shouldValidate: true,
    });
    closeSelectPropsModal();
  };

  const deleteSelectedHousing = (id: string) => {
    const nextSelectedHousings = selectedHousings?.filter(({value}) => {
      return value !== id;
    });
    setValue(FORM_NAMES.selectedHousings, nextSelectedHousings, {
      shouldDirty: true,
      shouldValidate: true,
    });

    toggleIsChecked(id);
  };

  const errorMessage = (errors[FORM_NAMES.selectedHousings] as any)?.message;

  const selectedHousingsNumber = selectedHousings?.length || 0;

  return (
    <Section
      title={t('select_properties')}
      subtitle={t('select_deal_properties_subtitle')}
    >
      <Counter>
        {selectedHousingsNumber === 1
          ? t('you_have_one_property_selected')
          : t('you_have_number_properties_selected', {
              number: selectedHousingsNumber,
            })}
      </Counter>
      {Boolean(selectedHousingsNumber) && (
        <SelectedPropsContainer>
          {selectedHousings?.map(({label, value}) => (
            <SelectedPropItem key={value}>
              <SelectedPropText>{label}</SelectedPropText>
              <TinyDeleteBtn
                disabled={disabled}
                onClick={() => deleteSelectedHousing(value)}
              />
            </SelectedPropItem>
          ))}
        </SelectedPropsContainer>
      )}
      <SelectPropsModal
        open={isSelectPropsModalOpen}
        onClose={closeSelectPropsModal}
        housingsOptions={housingOptions}
        toggleIsChecked={toggleIsChecked}
        toggleSelectAll={toggleSelectAll}
        checkboxes={checkboxes}
        isAllChecked={isAllChecked}
        isLoading={isLoadingHousingOptions}
        onExport={saveSelectedHousings}
      />
      <SelectButtonWrapper>
        <Button
          danger={Boolean(errorMessage)}
          disabled={disabled}
          label={t('select_properties')}
          onClick={openSelectPropsModal}
        />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </SelectButtonWrapper>
    </Section>
  );
}

export {OfferSelectHousingsSection};
