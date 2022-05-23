import React from 'react';
import {useTranslation} from 'react-i18next';
import {useReservation} from '../../context/reservation';
import Header from '../Header';
import ContentTile from '../ContentTile';

function CivitatisiFrame() {
  const {t, i18n} = useTranslation();
  const {data: reservation} = useReservation();

  const getLanguage = () => {
    const language = i18n?.language.split('-')[0];

    return language;
  };

  const getLocation = () => {
    const location = reservation?.housing?.location?.city
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

    switch (location) {
      case 'sevilla':
        return '57';

      case 'madrid':
        return '2';

      case 'bilbao':
        return '75';

      case 'barcelona':
        return '35';

      case 'granada':
        return '52';

      case 'valencia':
        return '120';

      case 'malaga':
        return '83';

      case 'alicante':
        return '95';

      default:
        return '2';
    }
  };

  return (
    <>
      <Header title={t('deals_and_experiences')} />
      <ContentTile>
        <div style={{textAlign: 'center'}}>
          <iframe
            className="civitatis-iframe"
            title="civitatis"
            src={`https://www.civitatis.com/widget-activities/?affiliated=13527&display=cosy&cant=12&lang=${getLanguage()}&currency=EUR&destination=${getLocation()}&transfer=0&cmp=Check-in online&width=100%&hideButton=1&centerContent=1&typeSelection=all&color=2148ff&typography=Lato&removeBackground=0&showShadow=1&roundedButtons=1`}
            width="100%"
            height="1850px"
            frameBorder={0}
            data-maxwidth="100%"
          />
        </div>
      </ContentTile>
    </>
  );
}

export {CivitatisiFrame};
