import {calculateFees} from './utils';

describe('calculates fees amount correctly', () => {
  test('calculates fees with integers correctly', () => {
    const feesAmount = calculateFees(100, 3);
    expect(feesAmount).toEqual(3.09);
  });

  test('calculates fees with floats correctly', () => {
    const feesPercenFloat = calculateFees(100, 3.05);
    expect(feesPercenFloat).toEqual(3.15);
    const feesSumFloat = calculateFees(100.55, 3);
    expect(feesSumFloat).toEqual(3.11);
    const feesBothFloat = calculateFees(100.55, 3.05);
    expect(feesBothFloat).toEqual(3.16);
  });
});
