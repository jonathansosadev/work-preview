import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useIsFormTouched} from '../../../utils/hooks';
import {SwitchProps} from '../Switch/Switch';
import Switch from '../Switch';
import {BlockHeader, Subtitle, SwitchItem, Title, Wrapper} from './styled';

type Option = {
  title: string;
  subtitle?: string;
  switch?: Omit<SwitchProps, 'onChange' | 'checked'> & {
    value: string;
    checked?: boolean;
    onChange?: (checked: boolean, event?: React.MouseEvent<HTMLDivElement>) => void;
  };
  value: string;
};

type SwitchBlocksProps = {
  options: Option[];
  field: string;
  setIsSwitchBlocksTouched: (isTouch: boolean) => void;
  disabled?: boolean;
  preloadData?: string;
  isRadio?: boolean;
};

const SwitchBlocks = React.memo(
  ({
    field,
    options,
    preloadData,
    disabled = false,
    setIsSwitchBlocksTouched,
  }: SwitchBlocksProps) => {
    const {setValue, watch} = useFormContext();
    const [activeOption, setActiveOption] = React.useState<Option | null>(null);
    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      watch,
      displayFields: {
        [field]: true,
      },
      defaultValues: {
        [field]: preloadData,
      },
    });

    React.useEffect(
      function syncActiveValuesWithForm() {
        if (!activeOption) return;
        if (activeOption?.switch?.checked) {
          setValue(field, activeOption.switch.value);
        } else {
          setValue(field, activeOption.value);
        }
      },
      [activeOption, field, setValue],
    );

    React.useEffect(
      function setTouchedIfFieldChanged() {
        setIsSwitchBlocksTouched(isFormTouched);
      },
      [isFormTouched, setIsSwitchBlocksTouched],
    );

    React.useEffect(
      function preloadingOption() {
        const optionFound = options.find(
          (singleOption) =>
            singleOption.value === preloadData ||
            singleOption.switch?.value === preloadData,
        );

        if (!optionFound) return;

        if (optionFound.switch?.value === preloadData) {
          const updatedOption: Option = {
            ...optionFound,
            switch: optionFound.switch && {...optionFound.switch, checked: true},
          };
          setActiveOption(updatedOption);
        } else {
          setActiveOption(optionFound);
        }
        setUntouchedValues({
          [field]: preloadData,
        });
      },
      [field, options, preloadData, setUntouchedValues],
    );

    const handleActiveOption = React.useCallback(
      (option: Option) => {
        const isSwitchDefaultChecked = preloadData === option.switch?.value;
        if (isSwitchDefaultChecked) {
          return handleActiveSwitch(option, true);
        }
        setActiveOption(option);
      },
      [preloadData],
    );

    const handleActiveSwitch = (
      option: Option,
      checked: boolean,
      event?: React.MouseEvent<HTMLDivElement>,
    ) => {
      event?.stopPropagation();
      const updatedOption: Option = {
        ...option,
        switch: option.switch && {
          ...option.switch,
          checked,
        },
      };
      setActiveOption(updatedOption);
      option.switch?.onChange?.(checked, event);
    };

    const getOptionsElements = React.useCallback(
      () =>
        options.map((option: Option) => {
          const {onChange, ...switchProps} = option?.switch || {};
          const isActiveOption =
            option.value === activeOption?.value ||
            option.switch?.value === activeOption?.switch?.value;

          return (
            <SwitchItem
              onClick={() => handleActiveOption(option)}
              disabled={disabled}
              $isActive={isActiveOption}
              key={option.title + option.value}
            >
              <BlockHeader>
                <Title>{option.title}</Title>
                {option.switch && isActiveOption && (
                  <Switch
                    onChange={(isChecked, event) => {
                      handleActiveSwitch(option, isChecked, event);
                    }}
                    checked={isActiveOption && activeOption?.switch?.checked}
                    {...switchProps}
                  />
                )}
              </BlockHeader>
              <Subtitle>{option.subtitle}</Subtitle>
            </SwitchItem>
          );
        }),
      [
        activeOption?.switch?.checked,
        activeOption?.switch?.value,
        activeOption?.value,
        disabled,
        handleActiveOption,
        options,
      ],
    );
    return <Wrapper>{getOptionsElements()}</Wrapper>;
  },
);

export {SwitchBlocks};
