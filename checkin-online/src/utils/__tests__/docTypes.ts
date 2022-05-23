import {COUNTRY_CODES} from '../constants';
import docTypes, {getDocTypes, getRemappedDocType} from '../docTypes';
import {getHousingCountryCode} from '../reservation';

test('returns correct doc types', () => {
  let allDocTypes: {[key: string]: Array<{value: string; label: string}>} = {};
  const supportedDocTypesCitizenships = [COUNTRY_CODES.czech];
  const supportedDocTypesNationalities = [
    COUNTRY_CODES.italy,
    COUNTRY_CODES.spain,
    COUNTRY_CODES.thailand,
    COUNTRY_CODES.uae,
  ];
  Object.values(COUNTRY_CODES).forEach((countryCode: string) => {
    const reservation = {
      housing: {
        location: {
          country: {
            code: countryCode,
          },
        },
      },
    };
    supportedDocTypesNationalities.forEach((nationality: string) => {
      const label = `Country: ${countryCode}, nationality: ${nationality}, `;
      allDocTypes[label] = getDocTypes(reservation, nationality);
    });

    supportedDocTypesCitizenships.forEach((citizenship: string) => {
      const label = `Country: ${countryCode}, citizenship: ${citizenship}`;
      allDocTypes[label] = getDocTypes(reservation, '', {citizenship});
    });
  });

  expect(allDocTypes).toMatchSnapshot();
});

test('remaps correctly', () => {
  let allDocTypes: {[key: string]: string} = {};
  const FOREIGN_DOC_TYPE = 'ID';
  const RESIDENCE_PERMIT = 'IX';
  const supportedDocTypes = [
    FOREIGN_DOC_TYPE,
    RESIDENCE_PERMIT,
    docTypes.passport().value,
  ];

  Object.values(COUNTRY_CODES).forEach((countryCode: string) => {
    const reservation = {
      housing: {
        location: {
          country: {
            code: countryCode,
          },
        },
      },
    };
    supportedDocTypes.forEach((docType: string) => {
      const label = `Country: ${countryCode}, docType: ${docType}`;
      allDocTypes[label] = getRemappedDocType({
        docType,
        countryCode: getHousingCountryCode(reservation),
      });
    });
  });

  expect(allDocTypes).toMatchSnapshot();
});

test('returns correct residence country types', () => {
  let allDocTypes: {[key: string]: Array<{value: string; label: string}>} = {};
  const supportedDocTypesResidenceCountries = [COUNTRY_CODES.greece];
  Object.values(COUNTRY_CODES).forEach((countryCode: string) => {
    const reservation = {
      housing: {
        location: {
          country: {
            code: countryCode,
          },
        },
      },
    };

    supportedDocTypesResidenceCountries.forEach((residenceCountry: string) => {
      const label = `Country: ${countryCode}, residenceCountry: ${residenceCountry}`;
      allDocTypes[label] = getDocTypes(reservation, 'BY', {residenceCountry});
    });
  });

  expect(allDocTypes).toMatchSnapshot();
});
