import React from 'react';
import {LanguageOption} from '../../utils/types';
import {useOutsideClick} from '../../utils/hooks';
import {CHANGE_LANGUAGE_TRIGGER_ID} from '../../utils/constants';
import {LanguageMenuContainer, LanguageItem, LanguageCountryIcon} from './styled';

type LanguageMenuProps = {
  onClose: () => void;
  onLanguageChange: (language: string) => void;
  activeOption: LanguageOption;
  open?: boolean;
  languageOptions: LanguageOption[];
};

function LanguageMenu({
  open,
  onClose,
  onLanguageChange,
  activeOption,
  languageOptions,
}: LanguageMenuProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleOutsideClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if ((event as any).target?.id === CHANGE_LANGUAGE_TRIGGER_ID) {
        return;
      }
      onClose();
    },
    [onClose],
  );
  useOutsideClick(containerRef, handleOutsideClick);

  if (!open) {
    return null;
  }

  return (
    <LanguageMenuContainer ref={containerRef}>
      {languageOptions.map(option => (
        <LanguageItem
          $active={activeOption.value === option.value}
          onClick={() => onLanguageChange(option.value as string)}
          key={option.value}
        >
          <LanguageCountryIcon src={option.icon} alt="Country flag" />
          {option.label}
        </LanguageItem>
      ))}
    </LanguageMenuContainer>
  );
}

export {LanguageMenu};
