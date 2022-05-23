const zoho = require('./zoho-api');
const { promisify } = require('util');
const zohoFetcher = require('./zoho-fetch-datas')
const zohoPost = require('./zoho-post-data')
const ContactService = require('../../../common/lib/garagescore/contact/service.js');
const ContactTypes = require('../../../common/models/contact.type.js');
const {
    handleGarageModifications,
    getMissingGaragesDetails,
} = require('./garages');
const { handleUserModifications, handleNewUserAddition } = require('./users');
const { handleDealModifications } = require('./deals');


const init = async ({ SEND, UPDATE, QUICK_MODE }, executionDay) => {
    try {
        if (QUICK_MODE) zoho.setPagesMax(2);
        if (UPDATE) zoho.activeUpdateMode();
        else console.info('-------------- READ ONLY MODE ----------------------');

        if (executionDay && (executionDay.getDay() === 6 || executionDay.getDay() === 0)) {
            return;
        } // Skip week-ends

        const zohoGarages = await zohoFetcher.fetchGaragesInfos()
        const garageUpdates = await handleGarageModifications(zohoGarages);
        await zohoPost.postGarages(garageUpdates)
        const zohoUsers = await zohoFetcher.fetchUserInfos()
        const usersAndLinksUpdates = await handleUserModifications(zohoUsers, zohoGarages);
        const missingUsers = await handleNewUserAddition(zohoUsers);

        await zohoPost.postUsers(missingUsers, usersAndLinksUpdates)
        const allZohoDeals = await zohoFetcher.fetchDeals()
        const dealsUpdates = await handleDealModifications(allZohoDeals);
        await zohoPost.postDeals(dealsUpdates);

        const [countMissingGarages, logsMissingGarages] = await getMissingGaragesDetails(zohoGarages);

        if (SEND) {
            const sendEmail = promisify((data, cb) => ContactService.prepareForSend(data, cb));

            for (const email of ['commerce@custeed.com']) {
                await sendEmail({
                    to: email,
                    from: 'no-reply@custeed.com',
                    sender: 'GarageScore',
                    type: ContactTypes.SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT,
                    payload: { logs: [...logsMissingGarages, ...zoho.getLogs()], countMissingGarages },
                });
            }
        }
        zoho.addlogs('Tout est synchronisé ! Bye...');
    } catch (err) {
        throw new Error(err.message)
    }

}


module.exports = {
    init
}