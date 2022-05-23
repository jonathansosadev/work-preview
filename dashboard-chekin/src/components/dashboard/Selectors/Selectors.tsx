import React from 'react';
import {useFormContext} from 'react-hook-form';
import i18n from 'i18n';
import {useIsFormTouched} from 'utils/hooks';
import {getDisplayFields} from 'utils/common';
import SelectorButton from '../SelectorButton';
import {SelectorButtonStyled, SelectorsWrapper, LabelWrapper, Name} from './styled';

export type SelectorData = {label: string; name: string; value?: string};
export type SelectorsData = SelectorData[];

const buildSelectors = (
  // key is a value for 't()' function of React-i18n, value is a back-end field
  options: {[key: string]: string},

  // key is a key of options, value is a value of radio button for back-end
  radioValues?: {[key: string]: string},
  contents?: {[key: string]: React.ReactNode},
) =>
  Object.entries(options).map((option) => {
    const [key, value] = option;
    return {
      label: i18n.t(key),
      content: contents?.[key],
      name: value,
      ...(radioValues && {value: radioValues[key]}),
    };
  });

export type SelectorsProps = {
  selectorsFormNames: {[key: string]: string};
  preloadedSelectorsData?: string | {[key: string]: any} | boolean | undefined;
  setIsSelectorsTouched?: any;
  isTabType?: boolean;
  className?: string;
  radioValues?: {[key: string]: any};
  disabled?: boolean;
  selectorsContents?: {[key: string]: React.ReactNode};
  isSectionActive?: boolean;
  setUntouchedValues?: any;
  defaultFormValues?: any;
  setIsAnySelectorActive?: React.Dispatch<React.SetStateAction<boolean>>;
  readOnly?: boolean;
  label?: string;
};

function Selectors({
  className,
  radioValues,
  disabled,
  preloadedSelectorsData,
  isSectionActive = true,
  isTabType = false,
  selectorsFormNames,
  setIsSelectorsTouched,
  setIsAnySelectorActive,
  defaultFormValues,
  selectorsContents,
  readOnly,
  label,
}: SelectorsProps) {
  const {watch, setValue, getValues} = useFormContext();
  const {isFormTouched, setUntouchedValues} = useIsFormTouched({
    displayFields: getDisplayFields(selectorsFormNames),
    watch,
    ...(defaultFormValues && {defaultValues: defaultFormValues}),
  });
  const [extractedSelectorsData, setExtractedSelectorsData] = React.useState<null | {
    [key: string]: boolean;
  }>(null);
  const isRadio = Boolean(radioValues);
  const selectors = buildSelectors(selectorsFormNames, radioValues, selectorsContents);

  React.useEffect(
    function handleDefaultValue() {
      if (defaultFormValues) {
        Object.entries(defaultFormValues).forEach(([key, value]) => setValue(key, value));
      }
    },
    [defaultFormValues, setValue],
  );

  React.useEffect(
    function extractTimingOptions() {
      if (!preloadedSelectorsData) return;
      if (!isSectionActive) return;
      if (isRadio) return;

      let timingOptions = Object.entries(preloadedSelectorsData).reduce((acc, option) => {
        const [key, value] = option;
        const isTimingOption = Object.values(selectorsFormNames).find((option) =>
          option.endsWith(key),
        );

        if (isTimingOption) {
          return {...acc, [key]: value};
        }

        return acc;
      }, {}) as {[key: string]: boolean};

      setExtractedSelectorsData(timingOptions);
    },
    [selectorsFormNames, preloadedSelectorsData, isSectionActive, isRadio],
  );

  React.useEffect(
    function preloadTimingOptions() {
      if (extractedSelectorsData) {
        Object.entries(extractedSelectorsData).forEach((option) => {
          const [key, value] = option;

          const timingOption = Object.values(selectorsFormNames).find((option) =>
            option.endsWith(key),
          );

          if (timingOption) {
            setValue(timingOption, value);
            setUntouchedValues((prevState: any) => ({
              ...prevState,
              [timingOption]: value,
            }));
          }
        });
      }
    },
    [selectorsFormNames, extractedSelectorsData, setValue, setUntouchedValues],
  );

  React.useEffect(
    function preloadRadioOptions() {
      if (!preloadedSelectorsData) return;
      if (!isRadio) return;

      const [selectorField] = Object.values(selectorsFormNames);
      setValue(selectorField, preloadedSelectorsData);
      setUntouchedValues((prevState: any) => ({
        ...prevState,
        [selectorField as any]: preloadedSelectorsData,
      }));
    },
    [isRadio, selectorsFormNames, preloadedSelectorsData, setUntouchedValues, setValue],
  );

  React.useEffect(
    function handleIsSectionTouched() {
      setIsSelectorsTouched?.(isFormTouched);
    },
    [isFormTouched, setIsSelectorsTouched],
  );

  const formValues = getValues();

  React.useEffect(
    function checkIsAnySelectorActive() {
      if (!setIsAnySelectorActive) return;

      const isAnySelectorChosen = Object.values(selectorsFormNames)
        .filter((key) =>
          Object.values(selectorsFormNames).find((option) => key === option),
        )
        .some((key) => formValues[key as keyof typeof formValues]);

      setIsAnySelectorActive(isAnySelectorChosen);
    },
    [formValues, selectorsFormNames, setIsAnySelectorActive],
  );

  return (
    <>
      {label && (
        <LabelWrapper>
          <Name className="label">{label}</Name>
        </LabelWrapper>
      )}
      <SelectorsWrapper isTabType={isTabType} className={className}>
        {selectors.map(
          (
            selector: {
              label: string;
              content: React.ReactNode;
              name: string;
              value?: string;
            },
            index: any,
          ) => {
            const currentValue = watch(selector.name);

            const isActive = isRadio ? currentValue === selector.value : currentValue;
            return isTabType ? (
              <SelectorButtonStyled
                type={isRadio ? 'radio' : 'checkbox'}
                key={index}
                content={selector.content || selector.label}
                active={isActive}
                disabled={disabled}
                name={selector.name}
                value={selector.value}
                readOnly={readOnly}
              />
            ) : (
              <SelectorButton
                type={isRadio ? 'radio' : 'checkbox'}
                key={index}
                content={selector.content || selector.label}
                active={isActive}
                disabled={disabled}
                name={selector.name}
                value={selector.value}
                readOnly={readOnly}
              />
            );
          },
        )}
      </SelectorsWrapper>
    </>
  );
}

export {Selectors};
