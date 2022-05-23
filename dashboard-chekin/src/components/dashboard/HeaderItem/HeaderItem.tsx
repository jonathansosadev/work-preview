import React from 'react';
import {ReactEntity} from '../../../utils/types';
import {useOutsideClick} from '../../../utils/hooks';
import {Container, ToggleWrapper, Menu, MenuItem} from './styled';

type OptionType = {
  label: ReactEntity;
  value: string;
  className?: string;
};

type HeaderItemProps = {
  menuOptions?: OptionType[];
  onMenuItemClick?: (value: string) => void;
  className?: string;
  children: ((active: boolean) => ReactEntity) | ReactEntity;
};

const defaultProps: HeaderItemProps = {
  children: () => null,
  menuOptions: [],
  onMenuItemClick: () => {},
};

function HeaderItem({
  menuOptions,
  onMenuItemClick,
  className,
  children,
}: HeaderItemProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const closeMenu = React.useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  useOutsideClick(containerRef, closeMenu);

  const toggleIsMenuOpen = () => {
    if (menuOptions?.length) {
      setIsMenuOpen((prevState) => !prevState);
    }
  };

  const handleMenuItemClick = (value: string) => {
    onMenuItemClick?.(value);
    closeMenu();
  };

  const isIconActive = isMenuOpen || isHovered;

  return (
    <Container className={className} ref={containerRef}>
      <ToggleWrapper
        onClick={toggleIsMenuOpen}
        onMouseOut={() => setIsHovered(false)}
        onMouseOver={() => setIsHovered(true)}
      >
        {typeof children === 'function' ? children?.(isIconActive) : children}
      </ToggleWrapper>
      {Boolean(menuOptions?.length) && isMenuOpen && (
        <Menu>
          {menuOptions?.map((option, index) => {
            return (
              <MenuItem
                className={option.className}
                key={index}
                onClick={() => handleMenuItemClick(option.value)}
              >
                <div>{option.label}</div>
              </MenuItem>
            );
          })}
        </Menu>
      )}
    </Container>
  );
}

HeaderItem.defaultProps = defaultProps;
export {HeaderItem};
