import React from 'react';
import {DAY_NAMES} from '../../../utils/types';
import {Offer} from '../../../utils/upselling/types';
import {useTranslation} from 'react-i18next';
import {Title} from '../styled';
import {AvailabilityDuration, AvailabilityGrid} from './styled';

type OfferAvailabilityProps = Pick<Offer, 'availability'>;

function OfferAvailability({availability}: OfferAvailabilityProps) {
  const {t} = useTranslation();
  const dayNamesTranslations = {
    [DAY_NAMES.monday]: t('monday'),
    [DAY_NAMES.tuesday]: t('tuesday'),
    [DAY_NAMES.wednesday]: t('wednesday'),
    [DAY_NAMES.thursday]: t('thursday'),
    [DAY_NAMES.friday]: t('friday'),
    [DAY_NAMES.saturday]: t('saturday'),
    [DAY_NAMES.sunday]: t('sunday'),
  };

  return (
    <>
      <Title>{t('availability')}</Title>
      <AvailabilityGrid>
        {(Object.values(DAY_NAMES) as DAY_NAMES[]).map(dayName => {
          const dayTranslation = dayNamesTranslations[dayName];
          const dayAvailability = availability.duration_availabilities.find(
            duration => duration.weekday === dayName,
          );

          if (dayAvailability) {
            const time = dayAvailability.is_all_day
              ? t('all_day')
              : `${dayAvailability.hours_start?.slice(
                  0,
                  5,
                )} - ${dayAvailability.hours_end?.slice(0, 5)}`;

            return (
              <AvailabilityDuration key={dayName}>
                <div>{dayTranslation}</div> <div>{time}</div>
              </AvailabilityDuration>
            );
          }

          return (
            <AvailabilityDuration key={dayName}>
              <div>{dayTranslation}</div>
              <div>{t('not_available')}</div>
            </AvailabilityDuration>
          );
        })}
      </AvailabilityGrid>
    </>
  );
}

export {OfferAvailability};
