import MomentTimezoneDataPlugin from 'moment-timezone-data-webpack-plugin';

const defaults = {
  matchZones: ['Europe/Paris'],
  startYear: 1970,
  endYear: 2030,
};

function momentTimezoneModule(moduleOptions) {

  const options = {
    ...defaults,
    ...this.options.momentTimezone,
    ...moduleOptions
  };

  this.extendBuild((config) => {
    config.plugins.push(new MomentTimezoneDataPlugin ({
      matchZones: options.matchZones,
      startYear: options.startYear,
      endYear: options.endYear,
    }))
  });
}

export default momentTimezoneModule;
