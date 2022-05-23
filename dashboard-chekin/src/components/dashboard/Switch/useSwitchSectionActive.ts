import React from 'react';

type Options = {
  canToggle?: (currentState: boolean) => boolean;
};

export function useSwitchSectionActive(
  preloadedSectionActive: boolean | undefined,
  {canToggle}: Options = {},
) {
  const [isSectionActive, setIsSectionActive] = React.useState(false);
  const [preloadedIsSendingEnabled, setPreloadedIsSendingEnabled] = React.useState<
    boolean | null
  >(null);

  React.useLayoutEffect(
    function preloadIsSectionActive() {
      if (preloadedSectionActive !== undefined) {
        setPreloadedIsSendingEnabled(preloadedSectionActive);
        setIsSectionActive(preloadedSectionActive);
      } else {
        setPreloadedIsSendingEnabled(false);
      }
    },
    [preloadedSectionActive],
  );

  const toggleIsSectionActive = () => {
    const isTogglingDisabled = canToggle && !canToggle(isSectionActive);
    if (isTogglingDisabled) {
      return;
    }

    setIsSectionActive((prevState) => !prevState);
  };

  const isSectionActiveTouched = isSectionActive !== !!preloadedIsSendingEnabled;

  return {
    isSectionActive:
      preloadedIsSendingEnabled !== null ? isSectionActive : !!preloadedSectionActive,
    toggleIsSectionActive,
    setIsSectionActive,
    isSectionActiveTouched,
  };
}
