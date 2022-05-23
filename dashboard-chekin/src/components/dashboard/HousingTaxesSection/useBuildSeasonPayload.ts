import React from 'react';
import {Moment} from 'moment';
import {COUNTRY_CODES} from '../../../utils/constants';
import {transformStringToBoolean} from './utils';
import {Exemption, SeasonRule} from '../../../utils/types';
import {FORM_NAMES, FORM_NAMES_FRANCE_TAXES, MIN_PRICE, SEASON_NAMES} from './constants';
import {FormTypes} from './HousingTaxesSection';

type BuildSeasonPayloadByCountry = {
  isBookingPercentagePrice: boolean;
  formValues: FormTypes;
  rules: Partial<SeasonRule>[];
  highSeasonStartDate?: Moment | null;
  highSeasonEndDate?: Moment | null;
  country?: string;
  housingId?: string;
  exemptions?: Partial<Exemption>[];
};

function useBuildSeasonPayload() {
  const buildHighSeasonPayloadByCountry = React.useCallback(
    ({
      country,
      formValues,
      housingId,
      exemptions,
      isBookingPercentagePrice,
      highSeasonStartDate,
      highSeasonEndDate,
      rules,
    }: BuildSeasonPayloadByCountry) => {
      const maxNightsTaxed = formValues?.[FORM_NAMES.maxNightsTaxed];
      const highAmount = formValues?.[FORM_NAMES.highAmount] || MIN_PRICE;

      switch (country) {
        case COUNTRY_CODES.france:
          return {
            exemptions,
            rules,
            name: SEASON_NAMES.high,
            housing_id: housingId,
            is_by_percent: isBookingPercentagePrice,
            from_date: highSeasonStartDate?.format('YYYY-MM-DD') || null,
            to_date: highSeasonEndDate?.format('YYYY-MM-DD') || null,
            price_per_night: isBookingPercentagePrice ? undefined : highAmount,
            percentage_per_booking: isBookingPercentagePrice ? highAmount : undefined,
            max_nights: maxNightsTaxed || undefined,
            is_max_nights_taxed: Boolean(maxNightsTaxed),
            [FORM_NAMES_FRANCE_TAXES.hasRegionTax]: transformStringToBoolean(
              formValues?.[FORM_NAMES_FRANCE_TAXES.hasRegionTax],
            ),
            [FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax]: transformStringToBoolean(
              formValues?.[FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax],
            ),
            [FORM_NAMES_FRANCE_TAXES.isClassified]: transformStringToBoolean(
              formValues?.[FORM_NAMES_FRANCE_TAXES.isClassified],
            ),
            [FORM_NAMES_FRANCE_TAXES.municipalTariff]:
              formValues?.[FORM_NAMES_FRANCE_TAXES.municipalTariff],
            [FORM_NAMES_FRANCE_TAXES.municipalPercentage]:
              formValues?.[FORM_NAMES_FRANCE_TAXES.municipalPercentage],
          };
        default:
          return {
            exemptions,
            rules,
            name: SEASON_NAMES.high,
            housing_id: housingId,
            is_by_percent: isBookingPercentagePrice,
            from_date: highSeasonStartDate?.format('YYYY-MM-DD') || null,
            to_date: highSeasonEndDate?.format('YYYY-MM-DD') || null,
            price_per_night: isBookingPercentagePrice ? undefined : highAmount,
            percentage_per_booking: isBookingPercentagePrice ? highAmount : undefined,
            max_nights: maxNightsTaxed || undefined,
            is_max_nights_taxed: Boolean(maxNightsTaxed),
          };
      }
    },
    [],
  );

  const buildHighSeasonPayload = React.useCallback(
    (props: BuildSeasonPayloadByCountry) => {
      return buildHighSeasonPayloadByCountry(props);
    },
    [buildHighSeasonPayloadByCountry],
  );

  const buildLowSeasonPayload = React.useCallback(
    ({
      formValues,
      housingId,
      exemptions,
      isBookingPercentagePrice,
      rules,
    }: BuildSeasonPayloadByCountry) => {
      const maxNightsTaxed = formValues?.[FORM_NAMES.maxNightsTaxed];
      const lowAmount = formValues?.[FORM_NAMES.lowAmount] || MIN_PRICE;

      return {
        exemptions,
        rules,
        name: SEASON_NAMES.low,
        housing_id: housingId,
        is_by_percent: isBookingPercentagePrice,
        price_per_night: isBookingPercentagePrice ? undefined : lowAmount,
        percentage_per_booking: isBookingPercentagePrice ? lowAmount : undefined,
        from_date: null,
        to_date: null,
        max_nights: maxNightsTaxed || undefined,
        is_max_nights_taxed: Boolean(maxNightsTaxed),
      };
    },
    [],
  );

  return {buildHighSeasonPayload, buildLowSeasonPayload};
}

export default useBuildSeasonPayload;
