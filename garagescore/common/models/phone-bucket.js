const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PhoneBucketTypes = require('../../common/models/phone-bucket.types.js');
const PhoneBucketCountryCodes = require('../../common/models/phone-bucket.country-codes.js');
const ContactService = require('../../common/lib/garagescore/contact/service.js');
const ContactTypes = require('../../common/models/contact.type');

const { promisify } = require('util');
const Mutex = require('locks').createMutex();

const lock = promisify(Mutex.lock).bind(Mutex);
const unlock = Mutex.unlock.bind(Mutex);
const sendEmail = promisify(ContactService.prepareForSend).bind(ContactService);

/**
 * OVH generated phone numbers
 */

const _sendInternalAlert = async (stock, area, garageId, garagePublicDisplayName) => {
  await sendEmail({
    to: 'plateforme@custeed.com',
    from: 'no-reply@custeed.com',
    sender: 'GarageScore',
    type: ContactTypes.SUPERVISOR_LACK_OF_PHONE,
    payload: {
      logs: [
        stock <= 0 ? 'Plus de téléphone disponibles !!!' : `Attention: Plus que ${stock} téléphones disponibles !`,
        garageId ? `Le garage ${garagePublicDisplayName} (${garageId}) n'a pas pu générer son numéro ! :(` : '',
      ],
      stock,
      area,
    },
  });
};

const areaAvailable = ['1', '2', '3', '4', '5'];
const DEFAULT_AREA = '1';

module.exports = (PhoneBucket) => {
  /**
   * Add a new phone, set it to "AVAILABLE" status
   */
  PhoneBucket.add = async (phoneNumber) => {
    if (!phoneNumber) throw new Error('Phone empty');
    if (!PhoneBucketCountryCodes.hasValue(phoneNumber.substring(0, 4)))
      throw new Error(`${phoneNumber} should start with 0033`);
    if (!areaAvailable.includes(phoneNumber.substring(4, 5)))
      throw new Error(`Area of ${phoneNumber} not in: ${areaAvailable.join(', ')}`);
    if (phoneNumber.match(/[^0-9]/)) throw new Error(`${phoneNumber} should only contain numbers`);
    if (phoneNumber.length > 15) throw new Error(`${phoneNumber} too long`);
    if (await PhoneBucket.findOne({ where: { value: phoneNumber } }))
      throw new Error(`Phone number ${phoneNumber} already in the bucket`);
    return PhoneBucket.create({
      value: phoneNumber,
      countryCode: phoneNumber.substring(0, 4),
      area: phoneNumber.substring(4, 5),
      status: PhoneBucketTypes.AVAILABLE,
    });
  };
  /**
   * Draw a phone, set it to "Taken" status
   */
  PhoneBucket.draw = async (
    area,
    garageId = null,
    garagePublicDisplayName = '',
    countryCode = PhoneBucketCountryCodes.FR
  ) => {
    await lock();
    try {
      const availablePhones = await PhoneBucket.find({
        where: { status: PhoneBucketTypes.AVAILABLE, area, countryCode },
      });
      if (!availablePhones || !availablePhones.length) {
        await _sendInternalAlert(0, area, garageId, garagePublicDisplayName);
        throw new Error(`No more phones for area 0${area}`);
      }
      const remainingPhones = availablePhones.length - 1;
      // Only send alert when it's lower than or equal to 10 and even (so it's not spamming)
      if (remainingPhones <= 10 && !(remainingPhones % 2)) {
        await _sendInternalAlert(remainingPhones, area);
      }
      // Take the first one
      const [drawn] = availablePhones;
      const updates = await drawn.updateAttributes({ garageId, drawnAt: new Date(), status: PhoneBucketTypes.TAKEN });
      unlock();
      return updates;
    } catch (e) {
      unlock();
      throw e;
    }
  };
  /**
   * Get area from phone number
   */
  PhoneBucket.getArea = ({ phone }, [firstFollowedPhone]) => {
    // If we have a phone number from Monaco, we take a area '4'
    if (phoneUtil.isValidNumberForRegion(phoneUtil.parse(phone || firstFollowedPhone, 'MC'), 'MC')) return '4';
    try {
      if (!areaAvailable.includes(phone.replace(/ /g, '')[1])) throw 'Fail';
      return phone.replace(/ /g, '')[1];
    } catch (e) {
      if (firstFollowedPhone && areaAvailable.includes(firstFollowedPhone[3])) return firstFollowedPhone[3];
    }
    return DEFAULT_AREA;
  };
  /**
   * Get all phones
   */
  PhoneBucket.getAll = async () => (await PhoneBucket.find({}, { value: 1 })).map((p) => p.value);
};
