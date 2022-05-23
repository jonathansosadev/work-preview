import React from 'react';
import {useTranslation} from 'react-i18next';
import {DraggableProvided} from 'react-beautiful-dnd';
import {SelectOption} from '../../../utils/types';
import {CUSTOM_FIELD_OPTION, Field} from '../CustomForm/CustomForm';
import dotsIcon from '../../../assets/dots-icon.svg';
import trashIcon from '../../../assets/rubbish.svg';
import editIcon from '../../../assets/edit-button.svg';
import guestLeaderIcon from '../../../assets/visble-guest-leader.svg';
import Tooltip from '../Tooltip';
import Select from '../Select';
import {
  Container,
  MandatoryLabel,
  StyledInput,
  Dots,
  StyledSwitch,
  DeleteButton,
  CustomFieldsTooltipTrigger,
  CustomFieldsTooltipWrapper,
  GuestLeaderIconTooltipTrigger,
  GuestLeaderTooltipWrapper,
  DefaultFieldContentWrapper,
  EditButton,
} from './styled';

type CustomFieldProps = {
  provided: DraggableProvided;
  field: Field;
  onRemove: () => void;
  onEdit: () => void;
  onChange: (option: SelectOption) => void;
  onRequiredChange: (required: boolean) => void;
  onGoToCustomField: () => void;
  disabled: boolean;
  fieldsOptions?: SelectOption[];
};

const CustomField = React.forwardRef<any, CustomFieldProps>(
  (
    {
      fieldsOptions,
      field,
      provided,
      onRequiredChange,
      onRemove,
      onEdit,
      onGoToCustomField,
      onChange,
      disabled,
    },
    ref,
  ) => {
    const {t} = useTranslation();

    const handleCustomFieldSelect = (option: SelectOption) => {
      if (option.value === CUSTOM_FIELD_OPTION.value) {
        onGoToCustomField();
        return;
      }

      onChange(option);
    };

    return (
      <Container {...provided.draggableProps} ref={ref}>
        {field.custom ? (
          <>
            <div>
              <Select
                value={field.label ? {value: field.label, label: field.label} : undefined}
                options={fieldsOptions}
                placeholder={t('enter_or_select_the_name_of_the_field')}
                onChange={handleCustomFieldSelect}
                disabled={disabled}
              />
              {!field.label && (
                <CustomFieldsTooltipWrapper>
                  <Tooltip
                    content={t('cant_find_custom_field_tips')}
                    trigger={
                      <CustomFieldsTooltipTrigger>
                        {t('can_find_a_field')}
                      </CustomFieldsTooltipTrigger>
                    }
                  />
                </CustomFieldsTooltipWrapper>
              )}
            </div>
            <StyledSwitch
              checked={field.required}
              onChange={onRequiredChange}
              label={t('required')}
              disabled={disabled}
            />
            {field.isLeaderField && (
              <GuestLeaderTooltipWrapper>
                <Tooltip
                  content={t('visible_for_guest_leader_only')}
                  trigger={
                    <GuestLeaderIconTooltipTrigger
                      src={guestLeaderIcon}
                      alt="Show guest leader info"
                    />
                  }
                />
              </GuestLeaderTooltipWrapper>
            )}
            <div>
              <EditButton onClick={onEdit} disabled={disabled}>
                <img src={editIcon} alt="Edit icon" />
              </EditButton>
              <DeleteButton onClick={onRemove} disabled={disabled}>
                <img src={trashIcon} alt="Rubbish" />
              </DeleteButton>
            </div>
          </>
        ) : (
          <>
            <StyledInput
              readOnly
              value={field.label}
              empty={!field.label}
              placeholder={t('enter_or_select_the_name_of_the_field')}
            />
            <DefaultFieldContentWrapper>
              {field.cannotEdit ? (
                <MandatoryLabel>{t('mandatory')}</MandatoryLabel>
              ) : (
                <StyledSwitch
                  checked={field.required}
                  onChange={onRequiredChange}
                  label={t('required')}
                  disabled={disabled}
                />
              )}
              {field.isLeaderField && (
                <GuestLeaderTooltipWrapper>
                  <Tooltip
                    content={t('visible_for_guest_leader_only')}
                    trigger={
                      <GuestLeaderIconTooltipTrigger
                        src={guestLeaderIcon}
                        alt="Show guest leader info"
                      />
                    }
                  />
                </GuestLeaderTooltipWrapper>
              )}
            </DefaultFieldContentWrapper>
            {!field.cannotDelete && (
              <DeleteButton onClick={onRemove} disabled={disabled}>
                <img src={trashIcon} alt="Rubbish" />
              </DeleteButton>
            )}
          </>
        )}
        <Dots {...provided.dragHandleProps}>
          <img src={dotsIcon} alt="Dots" />
        </Dots>
      </Container>
    );
  },
);

export {CustomField};
