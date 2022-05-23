var surveyGetCommonQuestions = function (customer, garage, requiredErrorTxt) {
  // eslint-disable-line
  var requiredErrorText = requiredErrorTxt;

  i18n.loadForSurveyJS('backoffice:survey:common-questions');

  if (!requiredErrorText) {
    requiredErrorText = t('compulsory');
  }

  function getDeepFieldValue(srcObject, fieldName) {
    var result = srcObject;
    var fieldParts = fieldName.split('.');
    for (var i = 0; i < fieldParts.length; i++) {
      if (typeof result === 'undefined') {
        return '';
      }
      result = result[fieldParts[i]];
    }
    return result;
  }

  var garageType = '{{ garage.type }}';

  var shareWithPartners = {
    type: 'radiogroup',
    choices: [
      { value: 'Oui', text: t('Yes') },
      { value: 'Non', text: t('No') },
    ],
    isRequired: true,
    name: 'shareWithPartners',
    title: t('shareWithPartners', {
      dealershipPartners: garageType === 'VehicleInspection' ? '' : ', Groupe La Centrale, Groupe Ouest-France',
    }),
  };

  var customerShareWithGarage = {
    type: 'checkbox',
    choices: [{ value: 'yes', text: t('customerShareWithGarage') }],
    name: 'customerShareWithGarage',
    title: ' ',
    requiredErrorText: requiredErrorText,
  };
  var formattedMobile = getDeepFieldValue(customer, 'contact.mobilePhone.value');
  if (formattedMobile) {
    formattedMobile = formattedMobile.replace('+33 ', '0');
  }
  var customerInfos = [
    {
      type: 'html',
      name: 'message5',
      html: t('customerInfos', {}, '<h5 class="sv_q_title">', '</h5>'),
    },
    {
      type: 'dropdown',
      name: 'title',
      title: t('title'),
      choices: [
        { value: 'Madame', text: t('Madame') },
        { value: 'Mademoiselle', text: t('Mademoiselle') },
        { value: 'Monsieur', text: t('Monsieur') },
        { value: 'Société', text: t('Société') },
      ],
      defaultValue: getDeepFieldValue(customer, 'title.value'),
    },
    {
      type: 'text',
      name: 'fullName',
      title: t('fullName'),
      defaultValue: getDeepFieldValue(customer, 'fullName.value'),
    },
    {
      type: 'text',
      name: 'email',
      title: t('email'),
      inputType: 'email',
      defaultValue: getDeepFieldValue(customer, 'contact.email.value'),
      validators: [
        {
          type: 'email',
        },
      ],
    },
    {
      type: 'text',
      name: 'mobilePhone',
      title: t('mobilePhone'),
      inputType: 'tel',
      defaultValue: formattedMobile,
      validators: [
        {
          type: 'mobilephonevalidator',
        },
      ],
    },
    {
      type: 'text',
      name: 'streetAddress',
      title: t('streetAddress'),
      defaultValue: getDeepFieldValue(customer, 'street.value'),
    },
    {
      type: 'text',
      name: 'postalCode',
      title: t('postalCode'),
      defaultValue: getDeepFieldValue(customer, 'postalCode.value'),
    },
    {
      type: 'text',
      name: 'city',
      title: t('city'),
      defaultValue: getDeepFieldValue(customer, 'city.value'),
    },
  ];

  return {
    shareWithPartners: shareWithPartners,
    customerShareWithGarage: customerShareWithGarage,
    customerInfos: customerInfos,
  };
};
