/**  * @jest-environment jsdom-sixteen  */
import React from 'react';
import {renderWithProviders} from '../../utils/test';
import {FormContext, useForm} from 'react-hook-form';
import {act, fireEvent, waitFor, screen} from '@testing-library/react';
import selectEvent from 'react-select-event';
import useSWR from 'swr';
import {AddPersonalDataForm, FORM_NAMES} from './AddPersonalDataForm';
import {
  COUNTRY_CODES,
  GROUP_TYPES,
  STAT_TYPES,
  STAT_TYPES_WITH_TAX_EXEMPTIONS,
} from '../../utils/constants';

function testDisplayFields(visibleFields: Array<string> = []) {
  visibleFields.forEach(name => {
    const field = screen.getByLabelText(name);
    expect(field).toBeInTheDocument();
  });

  const hiddenFields = Object.values(FORM_NAMES).filter(n => {
    return !visibleFields.includes(n);
  });
  hiddenFields.forEach(name => {
    const field = screen.queryByLabelText(name);
    expect(field).not.toBeInTheDocument();
  });
}

async function submitAndTestRequiredFieldsNumber(requiredNumber: number) {
  const submitButton = screen.getAllByText(/^next$/i)[1];
  await act(async () => {
    await fireEvent.click(submitButton);
    const errors = await screen.findAllByText(/required/i);
    expect(errors).toHaveLength(requiredNumber);
  });
}

function setupSWRResponse({
  response = {},
  implementation,
}: {
  response?: any;
  implementation?: (url?: string) => any;
} = {}) {
  const locations = Object.values(COUNTRY_CODES).map(countryCode => {
    return {
      country: {
        code: countryCode,
        name: countryCode,
      },
    };
  });

  const swrBase = {
    isValidating: false,
    mutate: jest.fn(),
    data: {},
  };

  const defaultResponse = {
    ...swrBase,
    data: {
      results: locations,
    },
  };

  const purposesOfStayResponse = {
    data: [
      {
        id: 'test',
        name: 'Purpose of stay',
      },
    ],
  };

  const phoneResponse = {
    data: [
      {
        country: {
          code: 'AF',
          alpha_3: 'AFG',
          name: 'Afghanistan',
        },
        phone_code: 93,
      },
      {
        country: {
          code: 'AL',
          alpha_3: 'ALB',
          name: 'Albania',
        },
        phone_code: 355,
      },
      {
        country: {
          code: 'DZ',
          alpha_3: 'DZA',
          name: 'Algeria',
        },
        phone_code: 213,
      },
    ],
  };

  const taxExemptionsResponse = {
    data: [
      {
        id: 'test',
        name: 'test',
        stat_type: 'test',
      },
    ],
  };

  // @ts-ignore
  useSWR.mockImplementation((url?: string) => {
    let result: any = response;

    if (url?.includes('purposes-of-stay')) {
      result = purposesOfStayResponse;
    }

    if (url?.includes('phone_code=1')) {
      result = phoneResponse;
    }

    if (url?.includes('stat-tax-exemptions')) {
      result = taxExemptionsResponse;
    }

    if (url?.includes('locations')) {
      result = defaultResponse;
    }

    if (url?.includes('unlock_links__reservation_id=')) {
      result = {data: []};
    }

    if (implementation) {
      const customResponse = implementation(url);
      if (customResponse) {
        result = customResponse;
      }
    }

    return {...swrBase, ...result};
  });
}

async function setDatepickerDate(
  datepicker: {
    day: HTMLElement;
    month: HTMLElement;
    year: HTMLElement;
  },
  date: Date,
) {
  await act(async () => {
    const day = String(date.getDate());
    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];
    const month = String(monthNames[date.getMonth()]);
    const year = String(date.getFullYear());
    fireEvent.change(datepicker.day, {target: {value: day}});
    await selectEvent.select(datepicker.month, month);
    fireEvent.change(datepicker.year, {target: {value: year}});
  });
}

const AddPersonalDataFormWithFormContext = () => {
  const methods = useForm();
  return (
    <FormContext {...methods}>
      <AddPersonalDataForm
        setIsBackButtonHidden={jest.fn()}
        areTermsAccepted={true}
        setAreTermsAccepted={jest.fn()}
      />
    </FormContext>
  );
};

beforeEach(() => {
  setupSWRResponse();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('validates form fields', async () => {
  renderWithProviders(<AddPersonalDataFormWithFormContext />);

  const nationalityField = screen.getByLabelText(FORM_NAMES.nationality);
  await act(async () => {
    await selectEvent.select(nationalityField, COUNTRY_CODES.spain);
    const secondSurnameField = await screen.findByText(FORM_NAMES.secondSurname);
    expect(secondSurnameField).toBeInTheDocument();
  });

  const submitButton = screen.getAllByText(/^next$/i)[1];
  await act(async () => {
    await fireEvent.click(submitButton);
  });
  const nameField = screen.getByLabelText(FORM_NAMES.name);
  const surnameField = screen.getByLabelText(FORM_NAMES.surname);
  const secondSurnameField = screen.getByLabelText(FORM_NAMES.secondSurname);
  const incorrectNameFieldValue = '123';
  await act(async () => {
    fireEvent.change(nameField, {target: {value: incorrectNameFieldValue}});
    expect(nameField).toHaveValue(incorrectNameFieldValue);
    fireEvent.change(surnameField, {target: {value: incorrectNameFieldValue}});
    expect(surnameField).toHaveValue(incorrectNameFieldValue);
    fireEvent.change(secondSurnameField, {target: {value: incorrectNameFieldValue}});
    expect(secondSurnameField).toHaveValue(incorrectNameFieldValue);
    await fireEvent.click(submitButton);
  });

  const incorrectNameErrors = await screen.findAllByText(
    /cant_contain_number_and_symbols/i,
  );
  expect(incorrectNameErrors).toHaveLength(3);

  const birthDateDayPicker = screen.getByLabelText(`${FORM_NAMES.birthDate}-day`);
  const birthDateMonthPicker = screen.getByLabelText(`${FORM_NAMES.birthDate}-month`);
  const birthDateYearPicker = screen.getByLabelText(`${FORM_NAMES.birthDate}-year`);
  const dateAfterToday = new Date('9/04/2030');
  await act(async () => {
    await setDatepickerDate(
      {
        day: birthDateDayPicker,
        month: birthDateMonthPicker,
        year: birthDateYearPicker,
      },
      dateAfterToday,
    );
    await fireEvent.click(submitButton);
  });
  const greaterThanTodayBirthDateError = await screen.findByText(
    /cant_be_equal_or_greater_than_today/i,
  );
  expect(greaterThanTodayBirthDateError).toBeInTheDocument();

  const dateBeforeToday = new Date('9/04/2010');
  await act(async () => {
    await setDatepickerDate(
      {
        day: birthDateDayPicker,
        month: birthDateMonthPicker,
        year: birthDateYearPicker,
      },
      dateBeforeToday,
    );
    await fireEvent.click(submitButton);
  });
  expect(greaterThanTodayBirthDateError).not.toBeInTheDocument();

  const docIssueDateDayPicker = screen.getByLabelText(`${FORM_NAMES.docDateOfIssue}-day`);
  const docIssueDateMonthPicker = screen.getByLabelText(
    `${FORM_NAMES.docDateOfIssue}-month`,
  );
  const docIssueDateYearPicker = screen.getByLabelText(
    `${FORM_NAMES.docDateOfIssue}-year`,
  );
  await act(async () => {
    await setDatepickerDate(
      {
        day: docIssueDateDayPicker,
        month: docIssueDateMonthPicker,
        year: docIssueDateYearPicker,
      },
      dateAfterToday,
    );
    await fireEvent.click(submitButton);
  });
  const greaterThanTodayIssueDateError = await screen.findByText(
    /cant_be_equal_or_greater_than_today/i,
  );
  expect(greaterThanTodayIssueDateError).toBeInTheDocument();

  const dateBeforeBirthDate = new Date('9/04/2008');
  await act(async () => {
    await setDatepickerDate(
      {
        day: docIssueDateDayPicker,
        month: docIssueDateMonthPicker,
        year: docIssueDateYearPicker,
      },
      dateBeforeBirthDate,
    );
    await fireEvent.click(submitButton);
  });
  const equalOrSmallerThanBirthDateError = await screen.findByText(
    /cant_be_equal_or_smaller_than_birth_date/i,
  );
  expect(equalOrSmallerThanBirthDateError).toBeInTheDocument();

  const dateAfterBirthDate = new Date('9/04/2015');
  await act(async () => {
    await setDatepickerDate(
      {
        day: docIssueDateDayPicker,
        month: docIssueDateMonthPicker,
        year: docIssueDateYearPicker,
      },
      dateAfterBirthDate,
    );
    await fireEvent.click(submitButton);
  });
  expect(equalOrSmallerThanBirthDateError).not.toBeInTheDocument();

  const dateAfterIssueDate = new Date('9/04/2018');
  await act(async () => {
    await setDatepickerDate(
      {
        day: birthDateDayPicker,
        month: birthDateMonthPicker,
        year: birthDateYearPicker,
      },
      dateAfterIssueDate,
    );
    await fireEvent.click(submitButton);
  });
  const equalOrAfterIssueDateError = await screen.findByText(
    /cant_be_equal_or_after_than_issue_date/i,
  );
  expect(equalOrAfterIssueDateError).toBeInTheDocument();

  const dateBeforeIssueDate = new Date('9/04/2010');
  await act(async () => {
    await setDatepickerDate(
      {
        day: birthDateDayPicker,
        month: birthDateMonthPicker,
        year: birthDateYearPicker,
      },
      dateBeforeIssueDate,
    );
    await fireEvent.click(submitButton);
  });
  expect(equalOrAfterIssueDateError).not.toBeInTheDocument();

  const docTypeField = await screen.findByLabelText(FORM_NAMES.docType);
  await act(async () => {
    await selectEvent.select(nationalityField, COUNTRY_CODES.spain);
    await selectEvent.select(docTypeField, 'documents.dni');
  });
  let docNumberField = screen.getByLabelText(FORM_NAMES.docNumber);
  await act(async () => {
    fireEvent.change(docNumberField, {target: {value: 'incorrect'}});
    fireEvent.click(submitButton);
  });
  let incorrectSpanishDocNumberFormatError = screen.getByText(
    /doc_number_dni_format_error/i,
  );
  expect(incorrectSpanishDocNumberFormatError).toBeInTheDocument();

  let correctDNISpanishFormat = '11111111C';
  fireEvent.change(docNumberField, {target: {value: correctDNISpanishFormat}});
  fireEvent.click(submitButton);
  await waitFor(() =>
    expect(screen.queryByText(/doc_number_dni_format_error/i)).not.toBeInTheDocument(),
  );

  let incorrectSpanishDocNumberLetterError = screen.getByText(
    /doc_number_dni_letter_error/i,
  );
  expect(incorrectSpanishDocNumberLetterError).toBeInTheDocument();

  let correctDNISpanishFormatAndLetter = '11111111h';
  fireEvent.change(docNumberField, {target: {value: correctDNISpanishFormatAndLetter}});
  fireEvent.click(submitButton);
  await waitFor(() =>
    expect(screen.queryByText(/doc_number_dni_letter_error/)).not.toBeInTheDocument(),
  );

  await act(async () => {
    await selectEvent.select(nationalityField, COUNTRY_CODES.italy);
    await selectEvent.select(docTypeField, 'documents.spanish_residence_permit');
  });

  docNumberField = await screen.findByLabelText(FORM_NAMES.docNumber);
  await act(async () => {
    fireEvent.change(docNumberField, {target: {value: 'incorrect'}});
    fireEvent.click(submitButton);
  });

  await act(async () => {
    incorrectSpanishDocNumberFormatError = await screen.findByText(
      /doc_number_nie_format_error/i,
    );
    expect(incorrectSpanishDocNumberFormatError).toBeInTheDocument();
  });

  let incorrectLastLetter = 'Z1234567T'; //R is correct last letter;
  fireEvent.change(docNumberField, {target: {value: incorrectLastLetter}});
  fireEvent.click(submitButton);
  await waitFor(() =>
    expect(screen.queryByText(/doc_number_nie_letter_error/)).toBeInTheDocument(),
  );

  let correctLastLetter = 'Z1234567R';
  fireEvent.change(docNumberField, {target: {value: correctLastLetter}});
  fireEvent.click(submitButton);
  await waitFor(() =>
    expect(screen.queryByText(/doc_number_nie_letter_error/)).not.toBeInTheDocument(),
  );

  await act(async () => {
    await selectEvent.select(nationalityField, COUNTRY_CODES.spain);
  });

  await act(async () => {
    await selectEvent.select(docTypeField, 'documents.driving_licence_es');
    fireEvent.change(docNumberField, {target: {value: 'incorrect'}});
    fireEvent.click(submitButton);
  });

  incorrectSpanishDocNumberFormatError = screen.getByText(/doc_number_dni_format_error/i);
  expect(incorrectSpanishDocNumberFormatError).toBeInTheDocument();

  correctDNISpanishFormat = '11111111C';
  fireEvent.change(docNumberField, {target: {value: correctDNISpanishFormat}});
  fireEvent.click(submitButton);
  await waitFor(() =>
    expect(screen.queryByText(/doc_number_dni_format_error/i)).not.toBeInTheDocument(),
  );

  correctDNISpanishFormatAndLetter = '11111111h';
  fireEvent.change(docNumberField, {target: {value: correctDNISpanishFormatAndLetter}});
  fireEvent.click(submitButton);
  await waitFor(() =>
    expect(screen.queryByText(/doc_number_dl_letter_error/)).not.toBeInTheDocument(),
  );
});

test('validates Italian form fields', async () => {
  const reservation = {
    data: {
      housing: {
        is_capture_stat_fields_enabled: true,
        location: {
          country: {
            code: COUNTRY_CODES.italy,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const nameField = screen.getByLabelText(FORM_NAMES.name);
  const incorrectNameFieldValue = 'testß';

  await act(async () => {
    fireEvent.change(nameField, {target: {value: incorrectNameFieldValue}});
    expect(nameField).toHaveValue(incorrectNameFieldValue);
  });

  const submitButton = screen.getAllByText(/^next$/i)[1];
  await act(async () => {
    await fireEvent.click(submitButton);
  });

  let incorrectNameErrors = await screen.findAllByText(
    /cant_contain_number_and_symbols/i,
  );
  expect(incorrectNameErrors).toHaveLength(1);

  const correctNameField = 'test';
  await act(async () => {
    fireEvent.change(nameField, {target: {value: correctNameField}});
    expect(nameField).toHaveValue(correctNameField);
  });

  await act(async () => {
    await fireEvent.click(submitButton);
  });

  await waitFor(() =>
    expect(screen.queryAllByText(/cant_contain_number_and_symbols/i)).toHaveLength(0),
  );
});

test('displays Spanish capture stat fields', async () => {
  const reservation = {
    data: {
      housing: {
        is_capture_stat_fields_enabled: true,
        location: {
          country: {
            code: COUNTRY_CODES.spain,
          },
        },
      },
    },
  };
  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.secondSurname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.docDateOfIssue,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.email,
  ];
  const nonRequiredField = 2;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(visibleFields.length - nonRequiredField);
  const secondSurnameRequiredError = screen.queryByTestId(
    `${FORM_NAMES.secondSurname}-error`,
  );
  expect(secondSurnameRequiredError).not.toBeInTheDocument();

  const residenceCountryField = screen.getByLabelText(FORM_NAMES.residenceCountry);
  await act(async () => {
    await selectEvent.select(residenceCountryField, COUNTRY_CODES.spain);
    const residenceCityField = await screen.findByLabelText(FORM_NAMES.residenceCity);
    const residenceProvince = await screen.findByLabelText(FORM_NAMES.residenceProvince);
    expect(residenceCityField).toBeInTheDocument();
    expect(residenceProvince).toBeInTheDocument();
  });
  const newFields = 2;
  const filledFields = 1;
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length + newFields - nonRequiredField - filledFields,
  );
});

test('displays Spanish fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.spain,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.secondSurname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.docDateOfIssue,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);
  const nonRequiredFields = 2;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - nonRequiredFields);
  const secondSurnameRequiredError = screen.queryByTestId(
    `${FORM_NAMES.secondSurname}-error`,
  );
  expect(secondSurnameRequiredError).not.toBeInTheDocument();

  const nationalityField = await screen.findByLabelText(FORM_NAMES.nationality);
  await act(async () => {
    await selectEvent.select(nationalityField, COUNTRY_CODES.spain);
    const cityOfIssueField = await screen.findByTestId(
      `${FORM_NAMES.secondSurname}-error`,
    );
    expect(cityOfIssueField).toBeInTheDocument();
  });
});

test('displays Portugal fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.portugal,
          },
        },
      },
    },
  };
  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.birthCountry,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.countryOfIssue,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);

  const optionalFields = 2;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
  const birthCountryRequiredError = screen.queryByTestId(
    `${FORM_NAMES.birthCountry}-error`,
  );
  expect(birthCountryRequiredError).not.toBeInTheDocument();
});

test('displays Italian leader fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.italy,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.birthCountry,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.countryOfIssue,
    FORM_NAMES.terms,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);
  const checkbox = 1;
  const optionalFields = 1;
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - checkbox - optionalFields,
  );

  const birthCountryField = screen.getByLabelText(FORM_NAMES.birthCountry);
  await act(async () => {
    await selectEvent.select(birthCountryField, COUNTRY_CODES.italy);
    const birthCityField = await screen.findByLabelText(FORM_NAMES.cityOfBirth);
    expect(birthCityField).toBeInTheDocument();
  });
  const countryOfIssueField = screen.getByLabelText(FORM_NAMES.countryOfIssue);
  await act(async () => {
    await selectEvent.select(countryOfIssueField, COUNTRY_CODES.italy);
    const cityOfIssueField = await screen.findByLabelText(FORM_NAMES.cityOfIssue);
    expect(cityOfIssueField).toBeInTheDocument();
  });
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - checkbox - optionalFields,
  );
});

test('displays Italian non-leader fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.italy,
          },
        },
      },
      guest_group: {
        leader_id: 'leader',
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.birthCountry,
    FORM_NAMES.terms,
    FORM_NAMES.email,
  ];
  const checkbox = 1;
  const optionalFields = 1;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - checkbox - optionalFields,
  );
});

test('displays Italian stat fields', async () => {
  const reservation = {
    data: {
      housing: {
        is_stat_registration_enabled: false,
        stat_account: {
          type: STAT_TYPES.valtellinaAbit,
        },
        location: {
          country: {
            code: COUNTRY_CODES.italy,
          },
        },
      },
      guest_group: {
        leader_id: 'leader',
      },
    },
  };

  const {rerenderWithProviders} = renderWithProviders(
    <AddPersonalDataFormWithFormContext />,
    reservation,
  );

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.birthCountry,
    FORM_NAMES.terms,
    FORM_NAMES.email,
  ];
  const checkbox = 1;
  const optionalFields = 1;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - checkbox - optionalFields,
  );

  const reservationWithStats = {
    data: {
      housing: {
        is_stat_registration_enabled: true,
        stat_account: {
          type: 'test',
        },
        location: {
          country: {
            code: COUNTRY_CODES.italy,
          },
        },
      },
      guest_group: {
        leader_id: 'leader',
      },
    },
  };

  await act(async () => {
    rerenderWithProviders(<AddPersonalDataFormWithFormContext />, reservationWithStats);
    const residenceCountry = await screen.findByLabelText(FORM_NAMES.residenceCountry);
    expect(residenceCountry).toBeInTheDocument();
    await selectEvent.select(residenceCountry, COUNTRY_CODES.france);
    let residenceCity = screen.queryByLabelText(FORM_NAMES.residenceCity);
    expect(residenceCity).not.toBeInTheDocument();

    await selectEvent.select(residenceCountry, COUNTRY_CODES.italy);
    residenceCity = await screen.findByLabelText(FORM_NAMES.residenceCity);
    expect(residenceCity).toBeInTheDocument();
  });

  for (const type of STAT_TYPES_WITH_TAX_EXEMPTIONS) {
    const reservationWithTaxExemptions = {
      data: {
        housing: {
          is_stat_registration_enabled: true,
          stat_account: {
            type: type,
          },
          location: {
            country: {
              code: COUNTRY_CODES.italy,
            },
          },
        },
        guest_group: {
          leader_id: 'leader',
        },
      },
    };
    await act(async () => {
      rerenderWithProviders(
        <AddPersonalDataFormWithFormContext />,
        reservationWithTaxExemptions,
      );
      const taxExemption = await screen.findByLabelText(FORM_NAMES.taxExemption);
      expect(taxExemption).toBeInTheDocument();
    });
  }
});

test('displays Italian non-leader contracts fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.italy,
          },
        },
        is_contract_enabled: true,
      },
      guest_group: {
        leader_id: 'leader',
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  let visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.birthCountry,
    FORM_NAMES.email,
    FORM_NAMES.terms,
  ];
  const optionalFields = 1;
  const terms = 1;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields - terms);
  const nationalityField = screen.getByLabelText(FORM_NAMES.nationality);
  await act(async () => {
    await selectEvent.select(nationalityField, COUNTRY_CODES.italy);
  });
  testDisplayFields(visibleFields);
  const nationality = 1;
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - optionalFields - nationality - terms,
  );
});

test('displays Germany fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.germany,
          },
        },
      },
      guest_group: {
        leader_id: 'leader',
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.email,
    FORM_NAMES.phone,
    FORM_NAMES.purposeOfStay,
  ];
  const optionalFields = 2;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
});

test('displays Dubai fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.uae,
          },
        },
      },
      guest_group: {
        leader_id: 'leader',
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.docNumber,
    FORM_NAMES.docType,
    FORM_NAMES.terms,
    FORM_NAMES.email,
  ];
  const checkbox = 1;
  const optionalFields = 1;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - checkbox - optionalFields,
  );
});

test('displays Netherlands fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.netherlands,
          },
        },
      },
      guest_group: {
        leader_id: 'leader',
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.docNumber,
    FORM_NAMES.docType,
    FORM_NAMES.email,
  ];
  const optionalFields = 1;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
});

test('displays Belgium fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.belgium,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.docNumber,
    FORM_NAMES.docType,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);

  const optionalFields = 3;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
  const residenceCityRequiredError = screen.queryByTestId(
    `${FORM_NAMES.residenceCity}-error`,
  );
  expect(residenceCityRequiredError).not.toBeInTheDocument();
  const residenceAddressError = screen.queryByTestId(
    `${FORM_NAMES.residenceAddress}-error`,
  );
  expect(residenceAddressError).not.toBeInTheDocument();
});

test('displays France fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.france,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.birthCountry,
    FORM_NAMES.cityOfBirth,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);

  const optionalFields = 2;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
  const birthCityRequiredError = screen.queryByTestId(`${FORM_NAMES.cityOfBirth}-error`);
  expect(birthCityRequiredError).not.toBeInTheDocument();
});

test('displays UK fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.uk,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.countryOfIssue,
    FORM_NAMES.nextDestinationCountry,
    FORM_NAMES.nextDestinationCity,
    FORM_NAMES.nextDestinationAddress,
    FORM_NAMES.email,
    FORM_NAMES.phone,
  ];
  testDisplayFields(visibleFields);

  const optionalFields = 3;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
  const nextDestinationAddressRequiredError = screen.queryByTestId(
    `${FORM_NAMES.nextDestinationAddress}-error`,
  );
  expect(nextDestinationAddressRequiredError).not.toBeInTheDocument();

  const nationalityField = screen.getByLabelText(FORM_NAMES.nationality);
  await act(async () => {
    await selectEvent.select(nationalityField, COUNTRY_CODES.uk);
  });
  const countryOfIssueField = screen.queryByLabelText(FORM_NAMES.countryOfIssue);
  expect(countryOfIssueField).not.toBeInTheDocument();
  const nextDestinationCountryField = screen.queryByLabelText(
    FORM_NAMES.nextDestinationCountry,
  );
  expect(nextDestinationCountryField).not.toBeInTheDocument();
  const nextDestinationCityField = screen.queryByLabelText(
    FORM_NAMES.nextDestinationCity,
  );
  expect(nextDestinationCityField).not.toBeInTheDocument();
  const nextDestinationAddressField = screen.queryByLabelText(
    FORM_NAMES.nextDestinationAddress,
  );
  expect(nextDestinationAddressField).not.toBeInTheDocument();

  const newHiddenFieldsNumber = 4;
  const newOptionalFieldsNumber = 2;
  const filledFields = 1;
  const optionalEmailField = 1;
  const optionalPhoneField = 1;
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length -
      newHiddenFieldsNumber -
      newOptionalFieldsNumber -
      filledFields -
      optionalEmailField -
      optionalPhoneField,
  );

  const docTypeRequiredError = screen.queryByTestId(`${FORM_NAMES.docType}-error`);
  expect(docTypeRequiredError).not.toBeInTheDocument();
  const docNumberRequiredError = screen.queryByTestId(`${FORM_NAMES.docNumber}-error`);
  expect(docNumberRequiredError).not.toBeInTheDocument();
});

test('displays Austrian leader fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.austria,
          },
        },
      },
      guest_group: {
        type: GROUP_TYPES.family,
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  let visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.residencePostalCode,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.docDateOfIssue,
    FORM_NAMES.countryOfIssue,
    FORM_NAMES.email,
    FORM_NAMES.phone,
    FORM_NAMES.purposeOfStay,
  ];
  testDisplayFields(visibleFields);
  const optionalFields = 3;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);

  const residenceCountry = screen.getByLabelText(FORM_NAMES.residenceCountry);
  await act(async () => {
    await selectEvent.select(residenceCountry, COUNTRY_CODES.austria);
  });

  testDisplayFields(visibleFields);
  const austrianOptionalFieldsNumber = 2;
  const filledResidenceCountry = 1;
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length -
      filledResidenceCountry -
      optionalFields -
      austrianOptionalFieldsNumber,
  );
});

test('displays family member Austrian fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.austria,
          },
        },
      },
      guest_group: {
        leader_id: 'leader',
        type: GROUP_TYPES.family,
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  let visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.birthDate,
    FORM_NAMES.terms,
    FORM_NAMES.email,
    FORM_NAMES.phone,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.residencePostalCode,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.purposeOfStay,
  ];

  const checkbox = 1;
  const optionalFields = 6;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - checkbox - optionalFields,
  );
});

test('displays Czech leader fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.czech,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.citizenship,
    FORM_NAMES.birthDate,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.purposeOfStay,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);
  const optionalFields = 1;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);

  const citizenshipField = screen.getByLabelText(FORM_NAMES.citizenship);
  await act(async () => {
    // Select non-EU citizenship
    await selectEvent.select(citizenshipField, COUNTRY_CODES.colombia);
  });
  const visaNumberField = screen.getByLabelText(FORM_NAMES.visaNumber);
  expect(visaNumberField).toBeInTheDocument();

  const filledFields = 1;
  const newFields = 1;
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - filledFields + newFields - optionalFields,
  );
});

test('displays Czech non-leader fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.czech,
          },
        },
      },
      guest_group: {
        leader_id: 'this reservation has leader',
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.citizenship,
    FORM_NAMES.birthDate,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);
  const optionalFields = 1;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);

  const citizenshipField = screen.getByLabelText(FORM_NAMES.citizenship);
  await act(async () => {
    // Select non-EU citizenship
    await selectEvent.select(citizenshipField, COUNTRY_CODES.colombia);
  });
  const visaNumberField = screen.getByLabelText(FORM_NAMES.visaNumber);
  expect(visaNumberField).toBeInTheDocument();

  const purposeOfStayField = screen.queryByLabelText(FORM_NAMES.purposeOfStay);
  expect(purposeOfStayField).not.toBeInTheDocument();

  const filledFields = 1;
  const newFields = 1;
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - filledFields + newFields - optionalFields,
  );
});

test('displays Colombian fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.colombia,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.secondSurname,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.arrivalCountry,
    FORM_NAMES.nextDestinationCountry,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);

  const optionalFields = 2;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
  const secondSurnameRequiredError = screen.queryByTestId(
    `${FORM_NAMES.secondSurname}-error`,
  );
  expect(secondSurnameRequiredError).not.toBeInTheDocument();

  const arrivalCountry = screen.getByLabelText(FORM_NAMES.arrivalCountry);
  await act(async () => {
    await selectEvent.select(arrivalCountry, COUNTRY_CODES.colombia);
  });
  const arrivalDistrict = screen.getByLabelText(FORM_NAMES.arrivalDistrict);
  expect(arrivalDistrict).toBeInTheDocument();
  const arrivalMunicipality = screen.getByLabelText(FORM_NAMES.arrivalMunicipality);
  expect(arrivalMunicipality).toBeInTheDocument();

  const nextDestinationCountry = screen.getByLabelText(FORM_NAMES.nextDestinationCountry);
  await act(async () => {
    await selectEvent.select(nextDestinationCountry, COUNTRY_CODES.colombia);
  });
  const nextDestinationDistrict = screen.getByLabelText(
    FORM_NAMES.nextDestinationDistrict,
  );
  expect(nextDestinationDistrict).toBeInTheDocument();
  const nextDestinationMunicipality = screen.getByLabelText(
    FORM_NAMES.nextDestinationMunicipality,
  );
  expect(nextDestinationMunicipality).toBeInTheDocument();

  const newFields = 4;
  const filledFields = 2;
  const optionalEmailField = 1;
  await submitAndTestRequiredFieldsNumber(
    visibleFields.length - 1 + newFields - filledFields - optionalEmailField,
  );
});

test('displays Romanian fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.romania,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.birthCountry,
    FORM_NAMES.cityOfBirth,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.purposeOfStay,
    FORM_NAMES.email,
  ];
  testDisplayFields(visibleFields);
  const optionalFields = 1;
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
});

test('displays Thailand fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.thailand,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.terms,
    FORM_NAMES.email,
    FORM_NAMES.phone,
  ];
  const checkbox = 1;

  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(visibleFields.length - checkbox);
});

test('displays Greece fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES.greece,
            name: COUNTRY_CODES.greece,
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);
  let visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.docType,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.residenceCity,
    FORM_NAMES.residenceAddress,
    FORM_NAMES.residencePostalCode,
    FORM_NAMES.docNumber,
    FORM_NAMES.docDateOfIssue,
    FORM_NAMES.countryOfIssue,
    FORM_NAMES.email,
    FORM_NAMES.phone,
  ];
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(visibleFields.length);

  const countryOfIssue = screen.getByLabelText(FORM_NAMES.countryOfIssue);
  await act(async () => {
    await selectEvent.select(countryOfIssue, COUNTRY_CODES.greece);
  });
  const cityOfIssue = await screen.findByLabelText(FORM_NAMES.cityOfIssue);
  expect(cityOfIssue).toBeInTheDocument();
});

test('displays default country fields', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: 'BY',
          },
        },
      },
    },
  };

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const visibleFields = [
    FORM_NAMES.name,
    FORM_NAMES.surname,
    FORM_NAMES.sex,
    FORM_NAMES.nationality,
    FORM_NAMES.birthDate,
    FORM_NAMES.residenceCountry,
    FORM_NAMES.docType,
    FORM_NAMES.docNumber,
    FORM_NAMES.email,
  ];
  const optionalFields = 1;
  testDisplayFields(visibleFields);
  await submitAndTestRequiredFieldsNumber(visibleFields.length - optionalFields);
});

test('displays custom fields in the correct order', async () => {
  const customForm = {
    id: '000b23ff594d4fa5a8f2b773f54bf39d',
    name: 'AUSTRIA',
    housings: ['69b61c098db348aa86ae32b909216c63'],
    country: COUNTRY_CODES.spain,
    fields_set: [
      {
        id: '5d25e8d594bd4c1687fe44bdabfc7544',
        field: {
          id: '30cb453780ff41598e906921b6dfb809',
          name: 'name',
          names: {},
          placeholders: {},
          is_required: true,
          is_custom: false,
          field_type: 'TEXT',
        },
        order: 1,
        is_required: true,
      },
      {
        id: '0596ea2e15a2408fa261c0738a0a0747',
        field: {
          id: '5b011c5798c64384adff7b3937c42ee2',
          name: 'surname',
          names: {},
          placeholders: {},
          is_required: true,
          is_custom: false,
          field_type: 'TEXT',
        },
        order: 2,
        is_required: true,
        form_id: '000b23ff594d4fa5a8f2b773f54bf39d',
      },
      {
        id: 'f2bf4402b4964839b94b1e8b997153fa',
        field: {
          id: '4db4a7d2bbf74c4683a8d572f0d01a21',
          name: 'nationality',
          names: {},
          placeholders: {},
          is_required: true,
          is_custom: false,
          field_type: 'SELECT',
        },
        order: 5,
        is_required: true,
        form_id: '000b23ff594d4fa5a8f2b773f54bf39d',
      },

      {
        id: '655da20d67044964a294c47876eb1852',
        field: {
          id: 'f351585382e945a9a32aface8b783d4a',
          name: 'email',
          names: {},
          placeholders: {},
          is_required: false,
          is_custom: false,
          field_type: 'TEXT',
        },
        order: 7,
        is_required: true,
        form_id: '000b23ff594d4fa5a8f2b773f54bf39d',
      },
      {
        id: '6eae623ff6d549a08a5e52788fe2b182',
        field: {
          id: 'decc56a79216473abd1660961dea5771',
          created_by: '45a6dc4900fc451ea9a4a1dc8db1a7e0',
          name: 'Date #1',
          names: [
            {
              EN: 'Date #1',
            },
          ],
          placeholders: [
            {
              EN: 'Placeholder',
            },
          ],
          is_required: false,
          is_custom: true,
          field_type: 'TEXT',
          created_at: '2021-02-17T15:40:01.201138Z',
          updated_at: '2021-02-17T15:40:01.201167Z',
        },
        order: 22,
        is_required: true,
        form_id: '000b23ff594d4fa5a8f2b773f54bf39d',
        created_at: '2021-02-25T09:22:19.003699Z',
        updated_at: '2021-02-25T09:22:19.003707Z',
      },
    ],
  };

  const reservation = {
    data: {
      housing: {
        id: 'testId',
        picture: {
          src: '',
        },
        location: {
          country: {
            code: 'ES',
          },
        },
      },
    },
  };

  setupSWRResponse({
    implementation: url => {
      const housingId = reservation.data.housing.id;

      if (url?.includes(`guest-custom-form/form/?housing_id=${housingId}&field_set=`)) {
        return {data: [{id: housingId}]};
      }

      if (url?.includes('guest-custom-form')) {
        return {
          data: customForm,
        };
      }
    },
  });

  renderWithProviders(<AddPersonalDataFormWithFormContext />);

  const displayedNames = customForm.fields_set.map(({field}) => {
    return field.name;
  });

  for await (let name of displayedNames) {
    const field = await screen.findByLabelText(name);
    expect(field).toBeInTheDocument();
  }

  const fieldsContainer = screen.getByTestId('fields');
  fieldsContainer.childNodes.forEach((node, i) => {
    const orderedName = new RegExp(displayedNames[i], 'i');
    expect(node).toHaveTextContent(orderedName);
  });

  let requiredFieldsNumber = 0;
  customForm.fields_set.forEach(formField => {
    if (formField.is_required) {
      requiredFieldsNumber += 1;
    }
  });

  await submitAndTestRequiredFieldsNumber(requiredFieldsNumber);
});

test('display custom non-leader and leader guest fields', async () => {
  const customForm = {
    id: '000b23ff594d4fa5a8f2b773f54bf39d',
    name: 'AUSTRIA',
    housings: ['69b61c098db348aa86ae32b909216c63'],
    country: COUNTRY_CODES.spain,
    fields_set: [
      {
        id: '5d25e8d594bd4c1687fe44bdabfc723',
        field: {
          id: '30cb453780ff41598e906921b6dfb80dasdsa9',
          name: 'name',
          names: {},
          placeholders: {},
          is_required: true,
          is_custom: false,
          field_type: 'TEXT',
        },
        order: 1,
        is_required: true,
        is_leaders_field: false,
      },
      {
        id: '5d25e8d594bd4c1687fe44bdabfc7544',
        field: {
          id: '30cb453780ff41598e906921b6dfb809',
          name: 'surname',
          names: {},
          placeholders: {},
          is_required: true,
          is_custom: false,
          field_type: 'TEXT',
        },
        order: 2,
        is_leaders_field: true,
        is_required: true,
      },
    ],
  };

  const reservationWithGuests = {
    data: {
      housing: {
        id: 'testId',
      },
      guest_group: {
        leader_id: 'this reservation has leader',
      },
    },
  };

  setupSWRResponse({
    implementation: url => {
      const housingId = reservationWithGuests.data.housing.id;

      if (url?.includes(`guest-custom-form/form/?housing_id=${housingId}&field_set=`)) {
        return {data: [{id: housingId}]};
      }

      if (url?.includes('guest-custom-form')) {
        return {
          data: customForm,
        };
      }
    },
  });

  const {rerenderWithProviders} = renderWithProviders(
    <AddPersonalDataFormWithFormContext />,
    reservationWithGuests,
  );

  const displayedNonLeaderNames = customForm.fields_set
    .filter(({is_leaders_field}) => {
      return !is_leaders_field;
    })
    .map(({field}) => {
      return field.name;
    });

  for await (let name of displayedNonLeaderNames) {
    const field = await screen.findByLabelText(name);
    expect(field).toBeInTheDocument();
  }

  const reservationWithoutGuests = {
    data: {
      ...reservationWithGuests.data,
      guest_group: {},
    },
  };

  rerenderWithProviders(<AddPersonalDataFormWithFormContext />, reservationWithoutGuests);

  const displayedLeaderNames = customForm.fields_set.map(({field}) => {
    return field.name;
  });

  for await (let name of displayedLeaderNames) {
    const field = await screen.findByLabelText(name);
    expect(field).toBeInTheDocument();
  }
});

test('shows doc type and number if custom form requires id or passport photo', async () => {
  const customForm = {
    id: '000b23ff594d4fa5a8f2b773f54bf39d',
    name: 'AUSTRIA',
    housings: ['69b61c098db348aa86ae32b909216c63'],
    country: COUNTRY_CODES.france,
    fields_set: [
      {
        id: '5d25e8d594bd4c1687fe44bdabfc723',
        field: {
          id: '30cb453780ff41598e906921b6dfb80dasdsa9',
          name: 'name',
          names: {},
          placeholders: {},
          is_required: true,
          is_custom: false,
          field_type: 'TEXT',
        },
        order: 1,
        is_required: true,
        is_leaders_field: false,
      },
      {
        id: '5d25e8d594bd4c1687fe44bdabfc7544',
        field: {
          id: '30cb453780ff41598e906921b6dfb809',
          name: 'surname',
          names: {},
          placeholders: {},
          is_required: true,
          is_custom: false,
          field_type: 'TEXT',
        },
        order: 2,
        is_leaders_field: true,
        is_required: true,
      },
    ],
  };

  const reservation = {
    data: {
      housing: {
        id: 'testId',
        location: {
          country: {
            code: COUNTRY_CODES.france,
          },
        },
      },
    },
  };

  setupSWRResponse({
    implementation: url => {
      const housingId = reservation.data.housing.id;

      if (url?.includes(`guest-custom-form/form/?housing_id=${housingId}&field_set=`)) {
        return {data: [{id: housingId}]};
      }

      if (url?.includes('guest-custom-form')) {
        return {
          data: customForm,
        };
      }
    },
  });

  renderWithProviders(<AddPersonalDataFormWithFormContext />, reservation);

  const docType = await screen.findByLabelText(FORM_NAMES.docType);
  expect(docType).toBeInTheDocument();
  const docNumber = await screen.findByLabelText(FORM_NAMES.docNumber);
  expect(docNumber).toBeInTheDocument();
});
