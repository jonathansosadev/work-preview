import React from 'react';
import api from '../../api';
// @ts-ignore
import {fireEvent, waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test';
import {CHECKBOXES, SignScreen} from './SignScreen';

jest.mock('../../api');

test('creates guest and updates/refreshes reservation', async () => {
  (api.guests.post as jest.Mock).mockResolvedValue({
    error: true,
  });
  (api.reservations.patch as jest.Mock).mockResolvedValue({
    error: true,
  });
  (api.reservations.getOne as jest.Mock).mockResolvedValue({
    error: true,
  });
  (api.housingExemptions.getById as jest.Mock).mockResolvedValue({
    data: null,
  });

  const {
    queryByText,
    queryByTestId,
    getAllByTestId,
    getByTestId,
    getByLabelText,
    history,
    rerenderWithProviders,
  } = renderWithProviders(<SignScreen />);

  const signaturePlaceholder = getByTestId(/signature-placeholder/i);
  expect(signaturePlaceholder).toBeInTheDocument();
  fireEvent.click(signaturePlaceholder);
  expect(signaturePlaceholder).not.toBeInTheDocument();
  const canvas = getByTestId(/canvas/i);
  fireEvent.change(canvas, {target: {value: 'test'}});
  expect(signaturePlaceholder).not.toBeInTheDocument();
  const termsCheckbox = getByLabelText(CHECKBOXES.terms);
  fireEvent.click(termsCheckbox);
  const termsCheckboxCheckedIcon = queryByTestId(`${CHECKBOXES.terms}-checkmark`);
  expect(termsCheckboxCheckedIcon).toBeInTheDocument();

  const submitButton = getAllByTestId('submit-btn')[1]; // Get Desktop button
  fireEvent.click(submitButton);
  expect(queryByText(/sending_your_data/)).toBeInTheDocument();
  await waitFor(() => expect(queryByText(/try_again_or_contact/)).toBeInTheDocument());
  expect(api.reservations.patch).toHaveBeenCalledTimes(1);
  expect(api.guests.post).not.toHaveBeenCalled();
  expect(api.reservations.getOne).not.toHaveBeenCalled();

  (api.reservations.patch as jest.Mock).mockResolvedValue({
    error: false,
  });
  fireEvent.click(submitButton);
  expect(queryByText(/sending_your_data/)).toBeInTheDocument();
  await waitFor(() => expect(queryByText(/sending_your_data/)).not.toBeInTheDocument());
  expect(api.reservations.patch).toHaveBeenCalledTimes(2);
  expect(api.guests.post).toHaveBeenCalledTimes(1);
  expect(api.reservations.getOne).not.toHaveBeenCalled();

  (api.guests.post as jest.Mock).mockResolvedValue({
    error: false,
  });
  expect(api.reservations.getOne).not.toHaveBeenCalled();
  fireEvent.click(submitButton);
  expect(queryByText(/sending_your_data/)).toBeInTheDocument();
  await waitFor(() => expect(queryByText(/sending_your_data/)).not.toBeInTheDocument());
  expect(queryByText(/try_again_or_contact/)).toBeInTheDocument();
  expect(api.reservations.patch).toHaveBeenCalledTimes(3);
  expect(api.guests.post).toHaveBeenCalledTimes(2);
  expect(api.reservations.getOne).toHaveBeenCalledTimes(1);

  (api.reservations.getOne as jest.Mock).mockResolvedValue({
    error: false,
  });
  fireEvent.click(submitButton);
  expect(queryByText(/sending_your_data/)).toBeInTheDocument();
  await waitFor(() => expect(queryByText(/sending_your_data/)).not.toBeInTheDocument());
  expect(queryByText(/try_again_or_contact/)).not.toBeInTheDocument();
  expect(api.reservations.patch).toHaveBeenCalledTimes(4);
  expect(api.guests.post).toHaveBeenCalledTimes(3);
  expect(api.reservations.getOne).toHaveBeenCalledTimes(2);

  const reservationWithMembers = {
    data: {
      guest_group: {
        members: [true],
      },
    },
  };
  rerenderWithProviders(<SignScreen />, reservationWithMembers);
  history.push('/', {});
  fireEvent.click(submitButton);
  expect(queryByText(/sending_your_data/)).toBeInTheDocument();
  await waitFor(() => expect(queryByText(/sending_your_data/)).not.toBeInTheDocument());
  expect(queryByText(/try_again_or_contact/)).not.toBeInTheDocument();
  expect(api.reservations.patch).toHaveBeenCalledTimes(4);
  expect(api.guests.post).toHaveBeenCalledTimes(4);
  expect(api.reservations.getOne).toHaveBeenCalledTimes(3);
});

test('signs, accepts terms and displays modals correctly', async () => {
  (api.guests.post as jest.Mock).mockResolvedValue({
    error: null,
  });
  (api.reservations.patch as jest.Mock).mockResolvedValue({
    error: null,
  });

  const {
    queryByText,
    queryByTestId,
    getAllByTestId,
    getByTestId,
    getByText,
    getAllByText,
    getByLabelText,
    history,
  } = renderWithProviders(<SignScreen />);

  const viewContractButton = queryByTestId(/contract-btn/i);
  expect(viewContractButton).not.toBeInTheDocument();
  const contractsCheckbox = queryByText(/contract_checkbox_label/i);
  expect(contractsCheckbox).not.toBeInTheDocument();
  const signaturePlaceholder = queryByTestId(/signature-placeholder/i);
  expect(signaturePlaceholder).toBeInTheDocument();

  const submitButton = getAllByTestId('submit-btn')[1]; // Get Desktop button
  fireEvent.click(submitButton);
  let signatureModalTitle = queryByText(/you_have_to_sign/i);
  expect(signatureModalTitle).toBeInTheDocument();
  const signNowModalButton = getByText(/sign_now/i);
  fireEvent.click(signNowModalButton);
  expect(signatureModalTitle).not.toBeInTheDocument();
  expect(signaturePlaceholder).not.toBeInTheDocument();

  fireEvent.click(submitButton);
  expect(getByText(/you_have_to_sign/i)).toBeInTheDocument();
  fireEvent.click(getByText(/sign_now/i));
  expect(queryByText(/you_have_to_sign/i)).not.toBeInTheDocument();

  const canvas = getByTestId(/canvas/i);
  fireEvent.change(canvas, {target: {value: 'test'}});
  fireEvent.click(submitButton);
  expect(queryByText(/you_have_to_sign/i)).not.toBeInTheDocument();
  const termsModalTitle = queryByText(/authorities_mark_mandatory_to_accept/i);
  expect(termsModalTitle).toBeInTheDocument();
  const acceptTermsModalButton = getAllByText(/accept_terms_and_conditions/i)[1];

  fireEvent.click(acceptTermsModalButton);
  expect(termsModalTitle).not.toBeInTheDocument();
  const termsCheckboxCheckedIcon = queryByTestId(`${CHECKBOXES.terms}-checkmark`);
  expect(termsCheckboxCheckedIcon).toBeInTheDocument();

  fireEvent.click(submitButton);
  expect(queryByText(/sending_your_data/)).toBeInTheDocument();
  await waitFor(() => expect(queryByText(/sending_your_data/)).not.toBeInTheDocument());
  expect(queryByText(/you_have_to_sign/i)).not.toBeInTheDocument();

  const clearCanvasButton = getByText(/clear/i);
  fireEvent.click(clearCanvasButton);
  fireEvent.click(submitButton);
  expect(queryByText(/you_have_to_sign/i)).toBeInTheDocument();
  fireEvent.click(getByText(/sign_now/i));
  expect(queryByText(/you_have_to_sign/i)).not.toBeInTheDocument();

  fireEvent.change(canvas, {target: {value: 'test2'}});
  history.push('/', {formData: {}});
  fireEvent.click(submitButton);
  expect(queryByText(/sending_your_data/)).toBeInTheDocument();
  await waitFor(() => expect(queryByText(/sending_your_data/)).not.toBeInTheDocument());
  expect(queryByText(/you_have_to_sign/i)).not.toBeInTheDocument();

  const termsCheckbox = getByLabelText(CHECKBOXES.terms);
  fireEvent.click(termsCheckbox);
  expect(termsCheckboxCheckedIcon).not.toBeInTheDocument();
  fireEvent.click(submitButton);
  expect(queryByText(/authorities_mark_mandatory_to_accept/i)).toBeInTheDocument();
  fireEvent.click(getAllByText(/accept_terms_and_conditions/i)[1]);
  expect(queryByText(/authorities_mark_mandatory_to_accept/i)).not.toBeInTheDocument();
});

test('displays contract elements, accepts terms & contract and displays contract modal correctly', async () => {
  (api.documents.getContracts as jest.Mock).mockResolvedValue({
    data: [],
    error: true,
  });
  const reservation = {
    data: {
      id: '01',
      housing: {
        is_contract_enabled: true,
      },
    },
  };

  const {
    queryByText,
    queryByTestId,
    getAllByTestId,
    getByTestId,
    getByText,
    findByText,
    findByTestId,
    rerenderWithProviders,
  } = renderWithProviders(<SignScreen />, reservation);

  const submitButton = getAllByTestId('submit-btn')[1]; // Get Desktop button

  const contractsCheckbox = queryByText(/contract_checkbox_label/);
  expect(contractsCheckbox).toBeInTheDocument();
  expect(getByText(/loading_contract/i)).toBeInTheDocument();
  const termsCheckboxCheckedIcon = queryByTestId(`${CHECKBOXES.terms}-checkmark`);
  const contractCheckboxCheckedIcon = queryByTestId(`${CHECKBOXES.contract}-checkmark`);
  expect(termsCheckboxCheckedIcon).not.toBeInTheDocument();
  expect(contractCheckboxCheckedIcon).not.toBeInTheDocument();

  const contractLoadingError = await findByText(/contract_loading_error/);
  expect(contractLoadingError).toBeInTheDocument();
  const contractsTryAgainButton = getByText(/try_again/);
  expect(contractsTryAgainButton).toBeInTheDocument();

  (api.documents.getContracts as jest.Mock).mockResolvedValue({
    data: [],
    error: false,
  });
  fireEvent.click(contractsTryAgainButton);
  expect(contractLoadingError).not.toBeInTheDocument();
  expect(contractsTryAgainButton).not.toBeInTheDocument();
  const loadingContractText = queryByText(/loading_contract/);
  expect(loadingContractText).toBeInTheDocument();
  const viewContractButton = await findByTestId(/contract-btn/);
  expect(viewContractButton).toBeInTheDocument();
  expect(loadingContractText).not.toBeInTheDocument();

  const signaturePlaceholder = getByTestId(/signature-placeholder/);
  fireEvent.click(signaturePlaceholder);
  const canvas = getByTestId(/canvas/);
  fireEvent.change(canvas, {target: {value: 'test'}});
  fireEvent.click(submitButton);
  const acceptTermsAndContractModalTitle = queryByText(
    /authorities_mark_mandatory_to_accept_contract/,
  );
  expect(acceptTermsAndContractModalTitle).toBeInTheDocument();
  const acceptTermsAndContractModalButton = getByText(/^accept$/);
  fireEvent.click(acceptTermsAndContractModalButton);
  expect(acceptTermsAndContractModalTitle).not.toBeInTheDocument();
  expect(queryByTestId(`${CHECKBOXES.terms}-checkmark`)).toBeInTheDocument();
  expect(queryByTestId(`${CHECKBOXES.contract}-checkmark`)).toBeInTheDocument();

  const reservationWithGuestMembers = {
    data: {
      id: '01',
      housing: {
        is_contract_enabled: true,
      },
      guest_group: {
        members: ['hi'],
      },
    },
  };
  rerenderWithProviders(<SignScreen />, reservationWithGuestMembers);
  expect(
    queryByText(/authorities_mark_mandatory_to_accept_contract/),
  ).not.toBeInTheDocument();
  expect(queryByText(/contract_checkbox_label/)).not.toBeInTheDocument();
  expect(queryByText(/loading_contract/i)).not.toBeInTheDocument();
});
