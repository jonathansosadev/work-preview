import DropdownPeriod from '~/components/global/DropdownPeriod.vue'
export default {
    component: DropdownPeriod,
    props: [
            {
              label: "availablePeriods",
              value:[
                {  
                  display: "90 derniers jours glissants",
                  groupId: "others",
                  id: "lastQuarter",
                  label: "des 90 derniers jours",
                  maxDate: "2021-12-16T19:24:43.506Z",
                  minDate: "2021-09-17T18:24:43.505Z",
                  selector: { from: "2021-09-16", to: "2021-12-16"}
                },
                {
                  display: "Année en cours",
                  groupId: "others",
                  id: "CURRENT_YEAR",
                  label: "de l'année en cours",
                  maxDate: "2021-12-31T22:59:59.999Z",
                  minDate: "2020-12-31T23:00:00.000Z",
                  selector: {from: "2020-12-16", to: "2021-12-16"}
                }
              ],
              inputType: "json"
            },
            {
              label: 'periodId',
              value: 'lastQuarter',
              inputType: 'string'
            },
            {
              label: 'setCurrentPeriod',
              value: (periodId)=>(alert(`Period Seleted ${periodId}`)),
              inputType: 'function'
            }
            
        ],
  }
  