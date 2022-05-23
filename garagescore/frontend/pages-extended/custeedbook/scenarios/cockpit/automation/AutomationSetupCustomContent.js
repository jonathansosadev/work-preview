/* SetupCustomContent */
import SetupCustomContent from "~/components/cockpit/automation/SetupCustomContent";

export default {
  component: SetupCustomContent,
  props: [
        {
          label: 'target',
          value: "M_M",
          inputType: 'text',
        },
        {
          label: 'availableGarages',
          value: [
            {
              "label": "Garage Dupont",
              "value": "Garage Dupont",
              "hasCustomContent": true
              },
              {
              "label": "Caravanning Martin",
              "value": "Caravanning Martin"
              },
              {
              "label": "Contrôle technique Durant",
              "value": "Contrôle technique Durant"
              },
              {
              "label": "Agent dupont",
              "value": "Agent dupont"
              },
              {
              "label": "Moto dubois",
              "value": "Moto dubois"
              },
              {
              "label": "Taller del Bosque",
              "value": "Taller del Bosque"
              },
              {
              "label": "Caravanning Garcia",
              "value": "Caravanning Garcia"
              },
              {
              "label": "Garaje Del Mar",
              "value": "Garaje Del Mar"
              },
              {
              "label": "Centro Del Cielo",
              "value": "Centro Del Cielo",
              "hasCustomContent": true
              },
              {
              "label": "Smith",
              "value": "Smith"
              },
              {
              "label": "Will",
              "value": "Will"
              }
          ],
          inputType: 'json',
        },
        {
          label: 'onValidate',
          value: () => {
            console.log('onValidate()');
          },
        },
        {
          label: 'filled',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'isModification',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'isOpen',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'isValid',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'label',
          value: 'Période de validité',
          inputType: 'text'
        },
        {
          label: 'onCancel',
          value: () => {
            console.log('onCancel()');
          },
        },
        {
          label: 'onSetActive',
          value: () => {
            console.log('onSetActive()');
          },
        },
        {
          label: 'onValidate',
          value: () => {
            console.log('onValidate()');
          },
        },
        {
          label: 'isFilled',
          value: () => {
            console.log('isFilled()');
          },
        },
        {
          label: 'prefilledValues',
          value: () => {
            console.log('prefilledValues()');
          },
        },
        {
          label: 'ref',
          value: 'activePeriod',
          inputType: 'text'
        },
        {
          label: 'stepName',
          value: 'activePeriod',
          inputType: 'text'
        },
        {
          label: 'subLabel',
          value: 'Définissez la durée pendant laquelle le contenu personnalisé sera....',
          inputType: 'text'
        },
        {
          label: 'customContentInputValue',
          value: { 'promotionalMessage': 'Moule frite et bière gratuit....' },
          inputType: 'json'
        },
        {
          label: 'customContentValidatedValue',
          value: { 'promotionalMessage': 'Moule frite et bière gratuit....' },
          inputType: 'json'
        },
        {
          label: 'activePeriodValidatedValue',
          value: { startDate: new Date(), endDate: new Date(), noExpirationDate: true },
          inputType: 'json'
        },
        {
          label: 'activePeriodInputValue',
          value: { startDate: new Date(), endDate: new Date(), noExpirationDate: true },
          inputType: 'json'
        },
        {
          label: 'setValidate',
          value: () => {
            console.log('setValidate()');
          },
        },
      ]
};