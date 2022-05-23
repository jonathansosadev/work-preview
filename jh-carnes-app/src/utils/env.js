let data = {};

const mode = {
  local: 1,
  scorpion: 2,
  production: 3
}

let Base;

switch (mode.production) {
  case mode.local: // Local
    Base = '192.168.1.119';
    data = {
      BASE_API: 'http://' + Base + '/CarneEnVara/api/public/api/',
      BASE_URL: 'http://' + Base + '/CarneEnVara/api/public/',
    };
    break;
  case mode.scorpion: // Scorpion
    Base = '45.173.197.126';
    data = {
      BASE_API: 'http://' + Base + '/CarneEnVara/public/api/',
      BASE_URL: 'http://' + Base + '/CarneEnVara/public/',
    };
    break;
  case mode.production:
    Base = 'https://publicserverxyz.xyz/CarneEnVara/api/';
    data = {
      BASE_API: Base + 'public/api/',
      BASE_URL: Base + 'public/',
    };
    break;
}

// Datos de redes sociales
const social = {
  _google: {
    client_id:
      '577066695214-bmhol9a0lb8eibs5pvje41juqv93qb3m.apps.googleusercontent.com',
    reversed_client_id:
      'com.googleusercontent.apps.577066695214-bmhol9a0lb8eibs5pvje41juqv93qb3m',
  },
  _facebook: {
    app_id: '520227088575026',
    secret_id: '7ab67ace5ce53090b7d7faec4658bd74',
  },
};

const STRIPE_SANDBOX = false;

const STRIPE_PUBLIC_KEY = STRIPE_SANDBOX ? 'pk_test_lcRxhaTM1HaIrILp6YqKrzJD' : 'pk_live_51HrUJeHIRZvVoW9TvpcQJ99Y1uL3Bta0bwdp5KCQ5VLJTvUC2NxyK8junKLetqZ7typ3xY9ph31y2dQK6yQFwww500cryHJReI';

export default {
  ...data,
  ...social,
  STRIPE_PUBLIC_KEY
};
