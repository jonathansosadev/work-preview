const mp_public_key = process.env.REACT_APP_MP_PUBLIC_KEY;

export let mpInstance;

const createMPInstance = (locale) => {
  // eslint-disable-next-line no-undef
  mpInstance = new MercadoPago(mp_public_key, locale);
};

createMPInstance("es-AR");

export let cardForm;

export const createCardFormInstance = (
  amount,
  reservation,
  contextCreatePaymentFunc
) => {
  const cardFormOptions = {
    amount: (amount / 1000).toString(),
    autoMount: true,
    form: {
      id: "form-checkout",
      cardholderName: {
        id: "form-checkout__cardholderName",
        placeholder: "Card Holder",
      },
      cardholderEmail: {
        id: "form-checkout__cardholderEmail",
        placeholder: "E-mail",
      },
      cardNumber: {
        id: "form-checkout__cardNumber",
        placeholder: "Card Number",
      },
      cardExpirationMonth: {
        id: "form-checkout__cardExpirationMonth",
        placeholder: "MM",
      },
      cardExpirationYear: {
        id: "form-checkout__cardExpirationYear",
        placeholder: "YYYY",
      },
      securityCode: {
        id: "form-checkout__securityCode",
        placeholder: "CVV",
      },
      installments: {
        id: "form-checkout__installments",
        placeholder: "Installments",
      },
      identificationType: {
        id: "form-checkout__identificationType",
        placeholder: "Document Type",
      },
      identificationNumber: {
        id: "form-checkout__identificationNumber",
        placeholder: "Document Number",
      },
      issuer: {
        id: "form-checkout__issuer",
        placeholder: "Issuer",
      },
    },
    callbacks: {
      onFormMounted: (error) => {
        if (error) return console.warn("Form Mounted handling error: ", error);
        console.log("Form mounted");
      },
      onFormUnmounted: (error) => {
        if (error)
          return console.warn("Form Unmounted handling error: ", error);
        console.log("Form unmounted");
      },
      onIdentificationTypesReceived: (error, identificationTypes) => {
        if (error)
          return console.warn("identificationTypes handling error: ", error);
        console.log("Identification types available: ", identificationTypes);
      },
      onPaymentMethodsReceived: (error, paymentMethods) => {
        if (error)
          return console.warn("paymentMethods handling error: ", error);
        console.log("Payment Methods available: ", paymentMethods);
      },
      onIssuersReceived: (error, issuers) => {
        if (error) return console.warn("issuers handling error: ", error);
        console.log("Issuers available: ", issuers);
      },
      onInstallmentsReceived: (error, installments) => {
        if (error) return console.warn("installments handling error: ", error);
        console.log("Installments available: ", installments);
      },
      onCardTokenReceived: (error, token) => {
        if (error) return console.warn("Token handling error: ", error);
        console.log("Token available: ", token);
      },
      onSubmit: (event) => {
        event.preventDefault();
        const cardData = cardForm.getCardFormData();
        console.log("CardForm data available: ", cardData);

        const paymentData = {
          token: cardData.token,
          installments: cardData.installments,
          payment_method_id: cardData.paymentMethodId,
          reservation,
        };

        contextCreatePaymentFunc(paymentData);
      },
      onFetching: (resource) => {
        console.log("Fetching resource: ", resource);

        // Animate progress bar
        const progressBar = document.querySelector(".progress-bar");
        progressBar.removeAttribute("value");

        return () => {
          progressBar.setAttribute("value", "0");
        };
      },
    },
  };

  // Step #3
  cardForm = mpInstance.cardForm(cardFormOptions);
};

export const unMountCurrentCardForm = () => {
  if (cardForm) cardForm.unmount();
  return;
};
