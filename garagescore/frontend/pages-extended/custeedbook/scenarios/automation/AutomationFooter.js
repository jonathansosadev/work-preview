/* Footer */
import Footer from "~/components/automation/Footer";

function stringProp(label, value) { return { label, value, inputType: 'text' }; }
export default {
  component: Footer,
  props: [
        {
          label: 'greetings',
          value: `Cordialement,`,
          inputType: 'text',
          isSlot: true
        },
        {
          label: 'sender',
          value: `L’équipe Garage auto de l'Ouest (Fiat Alfa Romeo Jeep Abarth Brest)`,
          inputType: 'text',
          isSlot: true
        },
        {
          label: 'cgu',
          value: `Toute l'équipe de Renault Athis-Mons.`,
          inputType: 'Vous pouvez consultez nos condition générale de vente <a href="#">CGV</a>',
          isSlot: true
        },
        {
          label: 'cgu',
          value: `Toute l'équipe de Renault Athis-Mons.`,
          inputType: 'Vous pouvez consultez nos condition générale de vente <a href="#">CGV</a>',
          isSlot: true
        },
      ]
};