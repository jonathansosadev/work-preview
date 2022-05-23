import React from 'react';
import searchBlueIcon from '../../../assets/search-blue-icn.svg';
import searchGrayIcon from '../../../assets/search-grey-icn.svg';
import {Button} from './styled';

type SearchButtonProps = {
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
};

function SearchButton({onClick, className, icon}: SearchButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Button
      onClick={onClick}
      className={className}
      onMouseOut={() => setIsHovered(false)}
      onMouseOver={() => setIsHovered(true)}
    >
      {icon ? (
        icon
      ) : (
        <img src={isHovered ? searchBlueIcon : searchGrayIcon} alt="Magnifier" />
      )}
    </Button>
  );
}

export {SearchButton};
