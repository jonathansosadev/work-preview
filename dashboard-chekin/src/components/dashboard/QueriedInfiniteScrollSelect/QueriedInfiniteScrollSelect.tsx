import React from 'react';
import {useQueryClient, useInfiniteQuery, InfiniteData} from 'react-query';
import {Paginated, SelectOption} from '../../../utils/types';
import {InfiniteScrollSelectProps} from '../InfiniteScrollSelect/InfiniteScrollSelect';
import {getSearchParamFromUrl} from '../../../utils/common';
import {useDebounce, useIsMounted} from '../../../utils/hooks';
import InfiniteScrollSelect from '../InfiniteScrollSelect';

const SEARCH_QUERY_DEBOUNCE_MS = 400;

function getConsumableOptions(data: InfiniteData<Paginated<SelectOption>>) {
  return data?.pages
    .map((data) => {
      return data?.results || [];
    })
    .flat();
}

type QueriedInfiniteScrollSelectProps = InfiniteScrollSelectProps & {
  fetcher: (
    key: string,
    page: number,
    searchQuery: string,
  ) => Promise<Paginated<SelectOption>>;
  queryKey: string;
  optionsFilter?: (options: SelectOption[]) => SelectOption[];
  onOptionsChange?: (options: SelectOption[]) => void;
  blockQuery?: boolean;
};

function QueriedInfiniteScrollSelect({
  fetcher,
  queryKey,
  optionsFilter,
  onOptionsChange,
  blockQuery,
  onInputChange,
  ...props
}: QueriedInfiniteScrollSelectProps) {
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [options, setOptions] = React.useState<SelectOption[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_QUERY_DEBOUNCE_MS);
  const isStartedTypingRef = React.useRef(false);

  React.useLayoutEffect(() => {
    async function resetQuery() {
      queryClient.removeQueries(queryKey);
      isStartedTypingRef.current = false;
    }

    if (isStartedTypingRef.current) {
      resetQuery();
    }
  }, [debouncedSearchQuery, queryClient, queryKey]);

  const fetchWithSearchQuery = React.useCallback(
    ({pageParam = 1}) => {
      return fetcher(queryKey, pageParam, debouncedSearchQuery);
    },
    [fetcher, queryKey, debouncedSearchQuery],
  );

  const {fetchNextPage, status, isFetchingNextPage, hasNextPage} = useInfiniteQuery<
    Paginated<SelectOption>
  >(queryKey, fetchWithSearchQuery, {
    getNextPageParam: (lastGroup) => {
      if (lastGroup?.next) {
        return Number(getSearchParamFromUrl('page', lastGroup.next));
      }
      return false;
    },
    onSuccess: (data) => {
      if (!isMounted.current) {
        return;
      }

      let options = getConsumableOptions(data);

      if (optionsFilter) {
        options = optionsFilter(options);
      }

      onOptionsChange?.(options);
      setOptions(options);
    },
    refetchOnWindowFocus: false,
    enabled: !blockQuery,
  });

  return (
    <InfiniteScrollSelect
      loading={isStartedTypingRef.current || (status === 'loading' && !options?.length)}
      onInputChange={(value: string) => {
        if (isFetchingNextPage || status === 'loading') {
          return;
        }
        if (searchQuery !== value) {
          queryClient.setQueryData(queryKey, {pages: []});
          setOptions([]);
          onOptionsChange?.([]);

          onInputChange?.(value);
          setSearchQuery(value);
          isStartedTypingRef.current = true;
        }
      }}
      inputValue={searchQuery}
      canLoadMore={hasNextPage}
      loadMoreItems={() => {
        if (!isFetchingNextPage) {
          return fetchNextPage();
        }
      }}
      options={options}
      {...props}
    />
  );
}

export {QueriedInfiniteScrollSelect};
