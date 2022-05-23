import React from 'react';
import {SelectOption, ShortHousing} from '../../../utils/types';

function setChecked(housings: SelectOption[], state: boolean) {
  return housings.reduce((acc, housing) => {
    return {...acc, [housing.value]: state};
  }, {});
}
function getSelectedHousingsCheckboxes(
  housingsOptions: {value: string; label: string; data?: ShortHousing}[],
  checkboxes: any,
): {value: string; label: string; data?: ShortHousing}[] {
  const chosenHousings = Object.keys(checkboxes)
    .filter((key) => checkboxes[key as keyof typeof checkboxes])
    .reduce((acc, selectedId) => {
      const selectedHousing = housingsOptions.find(({value}) => value === selectedId);

      if (selectedHousing) {
        const {label, value, data} = selectedHousing;

        return [...acc, {label, value, data}];
      }

      return acc;
    }, [] as any[]);

  return chosenHousings;
}

function useHousingsSelectCheckboxes(
  housingsOptions: SelectOption[],
  preloadedCheckedHousings?: string[],
) {
  const [isAllChecked, setIsAllChecked] = React.useState(false);
  const [preloadedCheckboxes, setPreloadedCheckboxes] = React.useState<{} | null>(null);
  const [checkboxes, setCheckboxes] = React.useState({});

  React.useEffect(
    function preloadCheckboxes() {
      if (Object.keys(checkboxes).length) return;
      if (!housingsOptions.length) return;
      if (preloadedCheckedHousings) {
        const newState = housingsOptions.reduce((acc, {value}) => {
          const preloadedHousing = preloadedCheckedHousings.find((checked) => {
            return checked.split('-').join('') === value;
          });

          if (preloadedHousing) {
            return {...acc, [preloadedHousing.split('-').join('')]: true};
          }

          return {...acc, [value]: false};
        }, {});
        setPreloadedCheckboxes(newState);
        setCheckboxes(newState);
      }
    },
    [housingsOptions, checkboxes, preloadedCheckedHousings],
  );

  React.useEffect(
    function handleIsAllCheckboxesChecked() {
      if (!Object.keys(checkboxes).length) return;
      const values = Object.values(checkboxes);

      const isChecked = values.every((checked) => {
        return checked;
      });

      setIsAllChecked(isChecked);
    },
    [checkboxes],
  );

  const toggleSelectAll = () => {
    setIsAllChecked((prevState) => {
      const nextState = !prevState;
      const allChecked = setChecked(housingsOptions, nextState);

      setCheckboxes(allChecked);
      return nextState;
    });
  };

  const toggleIsChecked = React.useCallback((id: string) => {
    setCheckboxes((prevState) => {
      return {
        ...prevState,
        [id]: !prevState[id as keyof typeof prevState],
      };
    });
  }, []);

  const isAnyCheckboxTouched =
    !!preloadedCheckboxes &&
    Object.keys(preloadedCheckboxes).some((checkbox) => {
      return (
        preloadedCheckboxes[checkbox as keyof typeof preloadedCheckboxes] !==
        checkboxes[checkbox as keyof typeof preloadedCheckboxes]
      );
    });

  return {
    checkboxes,
    toggleIsChecked,
    toggleSelectAll,
    isAllChecked,
    isAnyCheckboxTouched,
    getSelectedHousingsCheckboxes,
  };
}

export {useHousingsSelectCheckboxes};
