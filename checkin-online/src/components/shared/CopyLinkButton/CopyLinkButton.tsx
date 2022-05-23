import React from 'react';
import {useTranslation} from 'react-i18next';
import {copyToClipboard} from '../../../utils/common';
import copyLink from '../../../assets/group-14871.svg';
import {CopyLinkButtonStyled} from './styled';

const copiedLinkTimeoutS = 1.5;

type CopyLinkButtonProps = {
  link: string | undefined;
  className?: string;
  isDisabled?: boolean;
  icon?: string;
};

function CopyLinkButton({
  className,
  link,
  isDisabled,
  icon = copyLink,
}: CopyLinkButtonProps) {
  const {t} = useTranslation();
  const [isLinkCopied, setIsLinkCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyShareLinkToClipboard = () => {
    if (!link) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    copyToClipboard(link);
    setIsLinkCopied(true);
    timeoutRef.current = setTimeout(() => {
      setIsLinkCopied(false);
    }, copiedLinkTimeoutS * 1000);
  };

  return (
    <CopyLinkButtonStyled
      link
      className={className}
      icon={<img src={icon} alt="Signs" />}
      type="button"
      disabled={isDisabled || !link}
      onClick={copyShareLinkToClipboard}
      label={<>{isLinkCopied ? t('copied') : t('copy_link_lowwer')}</>}
    />
  );
}

export {CopyLinkButton};
