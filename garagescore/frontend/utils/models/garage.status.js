import Enum from '~/utils/enum.js';

const _valueToCode = {
  Waiting: 0,
  DataMissing: 1,
  ToStart: 2,
  ToCreate: 2.1,
  ToPlug: 2.2,
  ToConfigure: 2.3,
  UsersMissing: 3.1,
  Ready: 3.2,
  RunningAuto: 4.1,
  RunningManual: 4.2,
  Stopped: 5,
  ErepOnly: 6,
}

export default new Enum(
  {
    WAITING: 'Waiting', // En attente - Lancement différé
    DATA_MISSING: 'DataMissing', // DMS non automatisable
    TO_CREATE: 'ToCreate', // Abonnement à créer 1
    TO_PLUG: 'ToPlug', // A brancher 2
    TO_CONFIGURE: 'ToConfigure', // A paramétrer 3
    USERS_MISSING: 'UsersMissing', // Users à créer
    READY: 'Ready', // Attente du GO de lancement 4
    RUNNING_AUTO: 'RunningAuto', // Garage lancé en automatique 5
    RUNNING_MANUAL: 'RunningManual', // Garage lancé en manuel
    STOPPED: 'Stopped', // Garage arrêté
    EREP_ONLY: 'ErepOnly', // Erep only, don't you know how to read ?
    // Etat de branchement : STATE, Bouton qui apparait quand on est a 4 pour le passer a 5
  },
  {
    displayName(value, language = 'fr') {
      if (typeof value === 'undefined') {
        console.error('The given value is undefined')
        return ''
      }
      if (!this.hasValue(value)) {
        console.error(`Value '${value}' is not supported by this Enum`)
        return value
      }
      return value //translate(value, language)
    },
    isRunning(value) {
      return value === this.RUNNING_AUTO || value === this.RUNNING_MANUAL
    },
    getCode: (value) => _valueToCode[value]
  }
)
