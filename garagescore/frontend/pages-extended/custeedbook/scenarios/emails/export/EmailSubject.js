import ExportEmailSubject from '../../../../emails/notifications/cockpit-exports/subject.vue';
import { ExportPeriods, ExportFrequencies } from '../../../../../utils/enumV2';

export default {
  component: ExportEmailSubject,
  props: [
    {
      label: 'alternativePayload',
      value: {
        frequency: ExportFrequencies.EVERY_DAY,
        downloadUrl:
          'https://archive.org/download/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4',
        locale: 'fr_FR',
        disableMailgunClickTracking: true,
        exportName: 'Coordonnées modifiées',
        exportType: 'CONTACTS_MODIFIED',
        dataTypes: ['All'],
        garageIds: ['All'],
        nGarages: 1,
        periodId: ExportPeriods.LAST_QUARTER,
        startPeriodId: null,
        endPeriodId: null,
      },
      inputType: 'json',
    },
    {
      label: 'useAlternativePayload',
      value: true,
      inputType: 'checkbox',
    },
  ],
};
