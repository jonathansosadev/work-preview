import React from 'react';
import {useTranslation} from 'react-i18next';
import {copyToClipboard} from '../../../utils/common';
import signsIcon from '../../../assets/signs.svg';
import {CopyButton} from './styled';

const COPIED_LINK_TIMEOUT_S = 1.5;

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
  icon = signsIcon,
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
    }, COPIED_LINK_TIMEOUT_S * 1000);
  };

  return (
    <CopyButton
      className={className}
      secondary
      type="button"
      disabled={isDisabled || !link}
      onClick={copyShareLinkToClipboard}
      label={
        <>
          <img src={icon} alt="Signs" />
          {isLinkCopied ? t('copied_exclamation') : t('copy_link')}
        </>
      }
    />
  );
}

export {CopyLinkButton};
