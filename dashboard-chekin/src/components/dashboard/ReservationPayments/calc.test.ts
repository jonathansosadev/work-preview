import {calc, convertToNumbersArray} from '../ReservationPayments/utils';

test('Calculating array of numbers correctly', () => {
  const mockedArray = [2, 0.2, 0.25, 0.255];

  expect(calc(mockedArray)).toBe(2.705);
});

test('Converts to number from mixed array', () => {
  const mockedArray = ['0.20', '0.25', '0.255'];

  expect(
    convertToNumbersArray(mockedArray).every((num) => typeof num === 'number'),
  ).toBeTruthy();
});
