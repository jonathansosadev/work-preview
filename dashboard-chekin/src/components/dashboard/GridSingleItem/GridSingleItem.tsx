import React from 'react';
import {useTranslation} from 'react-i18next';
import rubbishBinIcon from 'assets/rubbish-bin.svg';
import Switch from '../Switch';
import {
  Container,
  Name,
  SwitchWrapper,
  ActionsGrid,
  ButtonsWrapper,
  DeleteButton,
} from './styled';

type GridSingleItemProps = {
  name: string;
  active?: boolean;
  onActiveSwitch?: (active: boolean, event: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

const defaultProps: Partial<GridSingleItemProps> = {
  active: false,
};

function GridSingleItem({
  name,
  onActiveSwitch,
  active,
  onDelete,
  onClick,
  className,
}: GridSingleItemProps) {
  const {t} = useTranslation();

  return (
    <Container onClick={onClick} className={className}>
      <Name title={name}>{name}</Name>
      <ActionsGrid>
        <SwitchWrapper active={active!}>
          {onActiveSwitch && (
            <Switch onChange={onActiveSwitch} checked={active} label={t('active')} />
          )}
        </SwitchWrapper>
        <ButtonsWrapper>
          {onDelete && (
            <DeleteButton onClick={onDelete}>
              <img src={rubbishBinIcon} alt="Delete" width={10} height={16} />
            </DeleteButton>
          )}
        </ButtonsWrapper>
      </ActionsGrid>
    </Container>
  );
}

GridSingleItem.defaultProps = defaultProps;
export {GridSingleItem};
