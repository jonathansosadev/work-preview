/* eslint-disable no-console */
module.exports = class SpeedOMeter {
  constructor(unitTime = 'min') {
    this.valuesToMonitor = new Map();
    if (unitTime === 'sec') {
      this.speed = 1000;
      this.speedStr = 'second';
    } else if (unitTime === 'hrs') {
      this.speed = 3600000;
      this.speedStr = 'hour';
    } else {
      this.speed = 60000;
      this.speedStr = 'minute';
    }
    this.defaultLabels = 0;
  }
  add(label = 'unnamedValue', initialValue = 0) {
    if (label === 'unnamedValue') {
      this.valuesToMonitor.set(`unnamedValue${this.defaultLabels}`, initialValue);
      this.defaultLabels++;
    } else {
      this.valuesToMonitor.set(label, initialValue);
    }
    if (!this.interval) {
      this.start();
    }
  }
  remove(label) {
    if (!this.valuesToMonitor.has(label)) {
      console.error(`Can't remove label ${label}. Not found.`);
    } else {
      this.valuesToMonitor.delete(label);
    }
  }
  update(label, value = 1) {
    if (!this.valuesToMonitor.has(label)) {
      console.error(`${label} not found.`);
    } else {
      this.valuesToMonitor.set(label, this.valuesToMonitor.get(label) + value);
    }
  }
  start() {
    this.interval = setInterval(() => {
      this.display();
    }, this.speed);
  }
  stop() {
    clearInterval(this.interval);
  }
  clean() {
    this.valuesToMonitor = new Map();
  }
  display() {
    if (!this.prevValuesToMonitor) {
      this.prevValuesToMonitor = new Map(this.valuesToMonitor);
    } else {
      const keys = Array.from(this.valuesToMonitor.keys());
      const values = Array.from(this.valuesToMonitor.values());
      if (keys.length === 1) {
        if (this.prevValuesToMonitor.has(keys[0])) {
          console.log(
            `${new Date()} : ${keys[0]} : ${values[0] - this.prevValuesToMonitor.get(keys[0])}/${
              this.speedStr
            } (Total : ${values[0]})`
          ); // eslint-disable-line
        }
        this.prevValuesToMonitor.set(keys[0], values[0]);
      } else if (keys.length > 1) {
        console.log(`${new Date()} :`);
        for (let i = 0; i < keys.length; i++) {
          if (this.prevValuesToMonitor.has(keys[i])) {
            console.log(
              `${keys[i]} : ${values[i] - this.prevValuesToMonitor.get(keys[i])}/${this.speedStr} (Total : ${
                values[i]
              })`
            );
          }
          this.prevValuesToMonitor.set(keys[i], values[i]);
        }
        console.log('----------');
      }
    }
  }
};
