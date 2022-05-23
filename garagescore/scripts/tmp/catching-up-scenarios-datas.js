const app = require('../../server/server');
const { ObjectId } = require('mongodb');
const { dayNumberToDate, todayDayNumber } = require('../../common/lib/util/time-helper');
const { concurrentpromiseAll } = require('../../common/lib/util/concurrentpromiseAll');
const runEvents = require('../../common/lib/garagescore/data-campaign/run/run-events');

/**
 * delete me when ticket #4947 is merge with master
 * temp script:: it's will rebuild campaign contactScenario
 */

const getGarageByGarageId = async (garageId) => {
  return app.models.Garage.getMongoConnector()
    .find({ _id: ObjectId(garageId) })
    .project({
      _id: 1,
      group: 1,
      campaignScenarioId: 1,
    })
    .toArray();
};

const getBoscaryGarages = async () => {
  return app.models.Garage.getMongoConnector()
    .find({ group: 'Boscary' })
    .project({
      _id: 1,
      group: 1,
      campaignScenarioId: 1,
    })
    .toArray();
};

const getGaragesByDatas = async () => {
  return app.models.Data.getMongoConnector()
    .aggregate([
      {
        $match: {
          createdAt: { $gt: new Date('2021-10-13 00:00:00.510Z'), $lt: new Date('2021-11-10 00:00:00.510Z') },
          'campaign.contactStatus.status': 'Scheduled',
          'campaign.status': 'Running',
          'campaign.contactScenario.nextCampaignContact': null,
        },
      },
      {
        $project: {
          garageId: {
            $toObjectId: '$garageId',
          },
        },
      },
      {
        $lookup: {
          from: 'garages',
          localField: 'garageId',
          foreignField: '_id',
          as: 'garage',
        },
      },
      {
        $unwind: '$garage',
      },
      {
        $group: {
          _id: '$garageId',
          group: { $first: '$garage.group' },
          campaignScenarioId: { $first: '$garage.campaignScenarioId' },
        },
      },
    ])
    .toArray();
};
// loopback -_-
const getCampaignScenario = async (scenarioId) => {
  return app.models.CampaignScenario.findOne({ id: ObjectId(scenarioId.toString()) });
};
// loopback -_-
const getDatasByGarage = (garageId) => {
  return app.models.Data.find({
    where: {
      garageId: garageId.toString(),
      createdAt: { gt: new Date('2021-10-13 00:00:00.510Z'), lt: new Date('2021-11-10 00:00:00.510Z') },
      'campaign.contactStatus.status': 'Scheduled',
      'campaign.status': 'Running',
      'campaign.contactScenario.nextCampaignContact': null,
    },
  });
};

/**
 *
 * @param { number } nextContactDay
 * @param { number } firstContactDay
 * @returns dayNumber or null
 */
const calculateSendContact = (nextContactDay, firstContactDay) => {
  if (!nextContactDay) {
    // contact already send
    return null;
  }
  if (nextContactDay <= firstContactDay) {
    // nextContactDay is the same firstContactDay or less, we need ASAP send the campaign tomorrow
    return todayDayNumber() + 1;
  }
  if (nextContactDay > firstContactDay) {
    // the campaign should be send later
    return nextContactDay;
  }
};

const updateCampaign = async (data, campaignScenario, group) => {
  if (group === 'Chanoine') {
    // skip datas for group chanoine
    return;
  }
  if (data.campaign && data.campaign.contactScenario) {
    const nextContact = await data.campaign_determineNextCampaignContact(runEvents.CAMPAIGN_STARTED, data);
    const contactByEmailDay = data.campaign.contactScenario.firstContactByEmailDay;
    const contactByPhoneDay = data.campaign.contactScenario.firstContactByPhoneDay;
    const nextCampaignContactDay = calculateSendContact(nextContact.day, contactByEmailDay || contactByPhoneDay);
    const nextCampaignContact = nextCampaignContactDay ? nextContact.key : null;
    const nextCampaignContactAt = nextCampaignContactDay ? dayNumberToDate(nextCampaignContactDay) : null;
    const nextCampaignReContactDay = campaignScenario.recontactAt(data);
    const importAt = new Date();

    const contactScenario = {
      nextCampaignReContactDay: nextCampaignReContactDay || null,
      nextCampaignContactDay: nextCampaignContactDay,
      nextCampaignContact: nextCampaignContact,
      nextCampaignContactAt: nextCampaignContactAt,
      nextCampaignContactEvent: runEvents.CAMPAIGN_STARTED,
      firstContactByEmailDay: nextCampaignContactDay || data.campaign.contactScenario.firstContactByEmailDay,
      firstContactByPhoneDay: nextCampaignContactDay || data.campaign.contactScenario.firstContactByPhoneDay,
    };

    await app.models.Data.getMongoConnector().updateOne(
      { _id: ObjectId(data.id.toString()) },
      {
        $set: {
          'campaign.contactScenario': contactScenario,
          'campaign.importedAt': importAt,
        },
      }
    );
  }
};

const _parseArgs = (args) => {
  let garageId = null;
  let boscary = null;

  if (args.includes('--garageId')) {
    garageId = args[args.indexOf('--garageId') + 1];
  }

  if (args.includes('--boscary')) {
    boscary = true;
  }

  return { garageId, boscary };
};

app.on('booted', async () => {
  try {
    console.time('execution_time');
    const { garageId, boscary } = _parseArgs(process.argv);
    let garages = null;
    let count = 0;

    if (garageId) {
      garages = await getGarageByGarageId(garageId);
    } else if (boscary) {
      garages = await getBoscaryGarages();
    } else {
      garages = await getGaragesByDatas();
    }

    for (const garage of garages) {
      const datasByGarage = await getDatasByGarage(garage._id);
      const campaignScenario = await getCampaignScenario(garage.campaignScenarioId);
      const promises = datasByGarage.map((data) => () => updateCampaign(data, campaignScenario, garage.group));

      await concurrentpromiseAll(promises, 200);
      console.log(`====progress:: ${++count}/${garages.length} garages done ☑`);
    }

    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error('there was an error', e);
    process.exit(1);
  }
});
