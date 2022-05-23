const TestApp = require('../../../common/lib/test/test-app');

const chai = require('chai');

const expect = chai.expect;
const assert = chai.assert;
const app = new TestApp();

const scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');
const { JobTypes } = require('../../../frontend/utils/enumV2');



describe('Scheduler', () => {
    beforeEach(async function beforeEach() {
        await app.reset();
        scheduler.setAppForTests(app);
    });

    it('Send sms at 01:00 am should report schedule contact job for SMS at 08:00 pm for FR garage', async () => {
        const insertedItem = await scheduler.insertJob(
            JobTypes.SEND_CONTACT_HIGH_PRIORITY,
            { contactId: '5ce46cbf94a7009632396f81' },
            new Date('January 10 2022 01:00'),
            {
                noPublicHolyday: true,
                noSunday: true,
                smsHours: true,
                locale: 'fr_FR'
            }
        );
        expect(!!insertedItem).to.equals(true);
        const [job] = await app.jobs();
        assert.deepEqual(job.scheduledAtAsDate, new Date('2022-01-10T07:00:00.000Z'))

    });
    it('Send sms on public holiday should be scheduled next working day 18 april 2022 to the 19 april 2022 for FR garage', async () => {
        const insertedItem = await scheduler.insertJob(
            JobTypes.SEND_CONTACT_HIGH_PRIORITY,
            { contactId: '5ce46cbf94a7009632396f81' },
            new Date('April 18 2022 12:00'),
            {
                noPublicHolyday: true,
                noSunday: true,
                smsHours: true,
                locale: 'fr_FR'
            }
        );
        expect(!!insertedItem).to.equals(true);
        const [job] = await app.jobs();
        assert.deepEqual(job.scheduledAtAsDate, new Date('2022-04-19T10:00:00.000Z'))

    });
    it('Send sms on public holiday followed by sunday should be scheduled next working day 01 January 2022 to the 03 January 2022 for FR garage', async () => {
        const insertedItem = await scheduler.insertJob(
            JobTypes.SEND_CONTACT_HIGH_PRIORITY,
            { contactId: '5ce46cbf94a7009632396f81' },
            new Date('January 01 2022 12:00'),
            {
                noPublicHolyday: true,
                noSunday: true,
                smsHours: true,
                locale: 'fr_FR'
            }
        );
        expect(!!insertedItem).to.equals(true);
        const [job] = await app.jobs();
        assert.deepEqual(job.scheduledAtAsDate, new Date('2022-01-03T11:00:00.000Z'))

    });

    it('Send sms on public holiday FR should NOT be scheduled next working day for ES garage', async () => {
        const insertedItem = await scheduler.insertJob(
            JobTypes.SEND_CONTACT_HIGH_PRIORITY,
            { contactId: '5ce46cbf94a7009632396f81' },
            new Date('May 08 2021 12:00'),
            {
                noPublicHolyday: true,
                noSunday: true,
                smsHours: true,
                locale: 'es_ES'
            }
        );
        expect(!!insertedItem).to.equals(true);
        const [job] = await app.jobs();
        assert.deepEqual(job.scheduledAtAsDate, new Date('2021-05-08T10:00:00.000Z'))

    });

    it('Send sms on public holiday should be scheduled next working day 06 January 2022 to the 07 January 2022 for ES garage', async () => {
        const insertedItem = await scheduler.insertJob(
            JobTypes.SEND_CONTACT_HIGH_PRIORITY,
            { contactId: '5ce46cbf94a7009632396f81' },
            new Date('January 06 2022 12:00'),
            {
                noPublicHolyday: true,
                noSunday: true,
                smsHours: true,
                locale: 'es_ES'
            }
        );
        expect(!!insertedItem).to.equals(true);
        const [job] = await app.jobs();
        assert.deepEqual(job.scheduledAtAsDate, new Date('2022-01-07T11:00:00.000Z'))

    });

});
