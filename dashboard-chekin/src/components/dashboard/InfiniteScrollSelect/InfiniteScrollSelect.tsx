import React, {ComponentType, CSSProperties} from 'react';
import {useTranslation} from 'react-i18next';
import InfiniteLoader from 'react-window-infinite-loader';
import {ListChildComponentProps} from 'react-window';
import {MenuListComponentProps} from 'react-select/src/components/Menu';
import {SelectOption} from '../../../utils/types';
import {SelectProps} from '../Select/Select';
import {
  StyledSelect,
  MenuMessage,
  Menu,
  MenuItem,
  MenuItemLoadingMessage,
} from './styled';

const ROW_HEIGHT = 60;
const LIST_HEIGHT = 322;
const LIST_WIDTH = 262;
const THRESHOLD = 5;
const INIT_OFFSET = 0;

export type InfiniteScrollSelectProps = SelectProps & {
  canLoadMore?: boolean;
  loadMoreItems?: () => void;
};

const InfiniteScrollSelect = React.forwardRef<unknown, InfiniteScrollSelectProps>(
  ({options = [], loading = false, loadMoreItems, canLoadMore, ...props}, ref) => {
    const {t} = useTranslation();
    const scrollOffsetRef = React.useRef(0);

    const MenuList: ComponentType<MenuListComponentProps<SelectOption, any>> = ({
      children,
    }) => {
      const childrenArray = React.Children.toArray(children);
      const itemCount = canLoadMore
        ? Number(options?.length) + 1
        : Number(options?.length);

      const Row: ComponentType<ListChildComponentProps> = ({index, style, ...rest}) => {
        const child = childrenArray[index];
        const isLastChild = index + 1 === childrenArray.length;
        const menuStyles = style as CSSProperties;

        if (!loading && !child && childrenArray.length) {
          return (
            <MenuItemLoadingMessage {...rest} style={menuStyles}>
              {t('loading')}...
            </MenuItemLoadingMessage>
          );
        }

        return (
          <MenuItem $isLastChild={isLastChild} {...rest} style={menuStyles}>
            {child}
          </MenuItem>
        );
      };

      if (loading && !scrollOffsetRef.current) {
        return <MenuMessage>{t('loading')}...</MenuMessage>;
      }

      if (!itemCount) {
        return <MenuMessage>{t('no_results')}</MenuMessage>;
      }

      return (
        <InfiniteLoader
          isItemLoaded={(index) => Boolean(options[index])}
          loadMoreItems={loading || !canLoadMore ? () => null : (loadMoreItems as any)}
          itemCount={itemCount}
          threshold={THRESHOLD}
        >
          {({onItemsRendered, ref}) => (
            <Menu
              ref={ref}
              onScroll={({scrollOffset}) => {
                scrollOffsetRef.current = scrollOffset;
              }}
              onItemsRendered={onItemsRendered}
              initialScrollOffset={loading ? INIT_OFFSET : scrollOffsetRef.current}
              itemCount={itemCount}
              itemSize={ROW_HEIGHT}
              width={LIST_WIDTH}
              height={LIST_HEIGHT}
            >
              {Row}
            </Menu>
          )}
        </InfiniteLoader>
      );
    };

    return (
      <StyledSelect
        components={{MenuList}}
        options={options}
        loading={loading}
        ref={ref}
        {...props}
      />
    );
  },
);

export {InfiniteScrollSelect};
