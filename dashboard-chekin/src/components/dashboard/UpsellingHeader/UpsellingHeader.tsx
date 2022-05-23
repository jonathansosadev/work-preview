import React from 'react';
import i18n from 'i18next';
import {InfiniteData, useQuery, useQueryClient} from 'react-query';
import api from '../../../api';
import {Housing, Paginated, SelectOption} from '../../../utils/types';
import CreateOfferButton from '../CreateOfferButton';
import {Container, StyledHeadingSelect, Title} from './styled';
import {toastResponseError} from '../../../utils/common';

export const ALL_HOUSINGS_OPTION = {
  label: i18n.t('all_properties'),
  value: 'all',
};

type UpsellingHeaderProps = {
  title: string;
  setHousingFilter: React.Dispatch<React.SetStateAction<SelectOption>>;
  housingFilter: SelectOption;
};

function UpsellingHeader({title, setHousingFilter, housingFilter}: UpsellingHeaderProps) {
  const queryClient = useQueryClient();
  const {data: housings} = useQuery<Pick<Housing, 'id' | 'name'>[]>(
    api.housings.ENDPOINTS.all('ordering=name&fields=id,name'),
    {
      initialData: () => {
        const infiniteFullHousings = queryClient.getQueryData<
          InfiniteData<Paginated<Housing>>
        >(['housings'], {
          exact: false,
        });

        const fullHousingsResults =
          infiniteFullHousings?.pages
            ?.map((page) => page.results || [])
            .filter((results) => results.length)
            .flat()
            .map((housing) => {
              return {id: housing!.id, name: housing!.name};
            }) || [];

        return fullHousingsResults || [];
      },
      onError: (error: any) => {
        toastResponseError(error);
      },
    },
  );

  const housingFilters = React.useMemo(() => {
    if (!housings) {
      return [ALL_HOUSINGS_OPTION];
    }

    return [
      ALL_HOUSINGS_OPTION,
      ...housings?.map((housing) => {
        return {
          value: housing.id,
          label: housing.name,
        };
      }),
    ];
  }, [housings]);

  return (
    <Container>
      {title ? (
        <Title>{title}</Title>
      ) : (
        <>
          <StyledHeadingSelect
            isSearchable
            value={housingFilter}
            onChange={setHousingFilter}
            options={housingFilters}
            defaultValue={ALL_HOUSINGS_OPTION}
            empty={false}
          />
          <CreateOfferButton position="bottom-right" />
        </>
      )}
    </Container>
  );
}

export {UpsellingHeader};
