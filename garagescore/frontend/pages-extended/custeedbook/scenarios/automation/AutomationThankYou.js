/* AutomationThankYou */
import ThankYou from "~/components/automation/ThankYou";

function stringProp(label, value) { return { label, value, inputType: 'text' }; }
export default {
  component: ThankYou,
  props: [
        {
          label: 'logo',
          value: `https://i.imgur.com/LhHWiq4.png`,
          inputType: 'text'
        },
        {
          label: 'title',
          value: `Merci !`,
          inputType: 'text',
          isSlot: true
        },
        {
          label: 'content',
          value: `Nous revenons vers vous dans le meilleurs délais possible.`,
          inputType: 'text',
          isSlot: true
        },
        {
          label: 'signature',
          value: `Toute l'équipe de Renault Athis-Mons.`,
          inputType: 'text',
          isSlot: true
        },
      ]
};