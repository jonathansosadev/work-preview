import React from 'react';
import {useTranslation} from 'react-i18next';
import {SelectOption} from '../../../utils/types';
import Loader from '../../common/Loader';
import {
  Checkbox,
  SelectAllWrapper,
  CheckboxesWrapper,
  LoaderWrapper,
  Container,
} from './styled';

type HousingsSelectCheckboxesProps = {
  allCheckboxLabel: string;
  housingsOptions: SelectOption[];
  toggleSelectAll: () => void;
  checkboxes: any;
  toggleIsChecked: any;
  isAllChecked: boolean;
  isLoading?: boolean;
};

function HousingsSelectCheckboxes({
  allCheckboxLabel,
  housingsOptions,
  checkboxes,
  toggleIsChecked,
  toggleSelectAll,
  isAllChecked,
  isLoading,
}: HousingsSelectCheckboxesProps) {
  const {t} = useTranslation();

  return (
    <Container>
      <SelectAllWrapper>
        <Checkbox
          onChange={toggleSelectAll}
          checked={isAllChecked}
          label={allCheckboxLabel}
          disabled={isLoading}
        />
      </SelectAllWrapper>
      <CheckboxesWrapper>
        {isLoading ? (
          <LoaderWrapper>
            <Loader height={35} width={35} label={t('loading')} />
          </LoaderWrapper>
        ) : (
          housingsOptions.map((option) => {
            return (
              <Checkbox
                checked={Boolean(checkboxes[option.value])}
                label={option.label}
                key={option.value}
                onChange={() => toggleIsChecked(option?.value)}
              />
            );
          })
        )}
      </CheckboxesWrapper>
    </Container>
  );
}

export {HousingsSelectCheckboxes};
