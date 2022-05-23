const reminderStatus = require('../../../models/data/type/userActions/reminder-status');
const unsatisfiedTicketStatus = require('../../../models/data/type/unsatisfied-ticket-status');
const { TicketActionNames } = require('../../../../frontend/utils/enumV2');
const DataTypes = require('../../../models/data/type/data-types');
const KpiTypes = require('../../../../common/models/kpi-type.js');
const { addMatchOnGarageId } = require('./kpiAggregatorHelper');

module.exports = async function aggregateUnsatisfiedKpi(app, { period, kpiType = null, garageIds = [] } = {}) {
  const baseUnsatisfiedConds = (type = null) => [
    { $gte: ['$unsatisfiedTicket.createdAt', period.min] },
    { $lte: ['$unsatisfiedTicket.createdAt', period.max] },
    ...(type ? [{ $eq: ['$unsatisfiedTicket.type', type] }] : []),
  ];
  const contactedCondition = {
    $or: [
      { $in: ['$$this.name', [TicketActionNames.GARAGE_SECOND_VISIT, TicketActionNames.CUSTOMER_CALL]] },
      {
        $and: [
          { $eq: ['$$this.reminderActionName', TicketActionNames.GARAGE_SECOND_VISIT] },
          { $ne: ['$$this.reminderStatus', reminderStatus.CANCELLED] },
        ],
      },
      { $eq: ['$$this.followupIsRecontacted', true] },
    ],
  };
  const buildProject = (...$and) => ({ $cond: { if: { $and }, then: 1, else: 0 } });

  // Setup MongoDB Matching
  const $match = {
    ...addMatchOnGarageId(garageIds, 'string'),
    shouldSurfaceInStatistics: true,
    'unsatisfiedTicket.createdAt': { $gte: period.min, $lte: period.max },
  };

  // Setup MongoDB Projection For UNSATISFIED
  const $project = {
    garageId: true,
    // To manage unassigned & undefined manager tickets we will map such values to 'Unassigned' instead of ignoring them
    userId: {
      $cond: {
        if: { $in: ['$unsatisfiedTicket.manager', [null, 'undefined']] },
        then: { $literal: 'Unassigned' },
        else: '$unsatisfiedTicket.manager',
      },
    },
    countUnsatisfied: buildProject(...baseUnsatisfiedConds()),
    // touched
    countUnsatisfiedUntouched: buildProject(...baseUnsatisfiedConds(), { $eq: ['$unsatisfiedTicket.touched', false] }),
    countUnsatisfiedUntouchedOpen: buildProject(
      ...baseUnsatisfiedConds(),
      { $eq: ['$unsatisfiedTicket.touched', false] },
      {
        $and: [
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    countUnsatisfiedTouched: buildProject(...baseUnsatisfiedConds(), { $eq: ['$unsatisfiedTicket.touched', true] }),
    countUnsatisfiedTouchedOpen: buildProject(
      ...baseUnsatisfiedConds(),
      { $eq: ['$unsatisfiedTicket.touched', true] },
      {
        $and: [
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    countUnsatisfiedTouchedClosed: buildProject(
      ...baseUnsatisfiedConds(),
      { $eq: ['$unsatisfiedTicket.touched', true] },
      {
        $or: [
          { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    //
    countUnsatisfiedReactive: buildProject(...baseUnsatisfiedConds(), { $eq: ['$unsatisfiedTicket.reactive', true] }),
    countUnsatisfiedAssigned: buildProject(...baseUnsatisfiedConds(), {
      $and: [
        { $ne: ['$unsatisfiedTicket.manager', 'undefined'] },
        { $ne: ['$unsatisfiedTicket.manager', null] },
        { $ne: ['$unsatisfiedTicket.manager', undefined] },
        { $ne: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
      ],
    }),
    countUnsatisfiedOpenUnassigned: buildProject(
      ...baseUnsatisfiedConds(),
      {
        $or: [
          { $eq: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
          ...['undefined', null, undefined].map((e) => ({ $eq: ['$unsatisfiedTicket.manager', e] })),
        ],
      },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] }
    ),
    countUnsatisfiedAllUnassigned: buildProject(
      ...baseUnsatisfiedConds(),
      {
        $or: [
          { $eq: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
          ...['undefined', null, undefined].map((e) => ({ $eq: ['$unsatisfiedTicket.manager', e] })),
        ],
      },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      {
        $allElementsTrue: {
          $map: {
            input: '$unsatisfiedTicket.actions',
            in: { $cond: { if: contactedCondition, then: false, else: true } },
          },
        },
      }
    ),
    countUnsatisfiedAllAssignedWithoutAction: buildProject(
      ...baseUnsatisfiedConds(),
      ...['undefined', null, undefined].map((e) => ({ $ne: ['$unsatisfiedTicket.manager', e] })),
      { $ne: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      {
        $allElementsTrue: {
          $map: {
            input: '$unsatisfiedTicket.actions',
            in: { $cond: { if: contactedCondition, then: false, else: true } },
          },
        },
      }
    ),
    countUnsatisfiedAllAlreadyContacted: buildProject(...baseUnsatisfiedConds(), {
      $or: [
        { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        {
          $anyElementTrue: {
            $map: {
              input: '$unsatisfiedTicket.actions',
              in: { $cond: { if: contactedCondition, then: true, else: false } },
            },
          },
        },
      ],
    }),
    countUnsatisfiedWaitingForContact: buildProject(...baseUnsatisfiedConds(), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_CONTACT],
    }),
    countUnsatisfiedContactPlanned: buildProject(...baseUnsatisfiedConds(), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CONTACT_PLANNED],
    }),
    countUnsatisfiedWaitingForVisit: buildProject(...baseUnsatisfiedConds(), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_VISIT],
    }),
    countUnsatisfiedVisitPlanned: buildProject(...baseUnsatisfiedConds(), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.VISIT_PLANNED],
    }),
    countUnsatisfiedWaitingForClosing: buildProject(...baseUnsatisfiedConds(), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_CLOSING],
    }),
    countUnsatisfiedClosedWithoutResolution: buildProject(...baseUnsatisfiedConds(), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION],
    }),
    countUnsatisfiedClosedWithResolution: buildProject(...baseUnsatisfiedConds(), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION],
    }),

    // Zoho needed fields
    countUnsatisfiedFollowupResponded: buildProject(...baseUnsatisfiedConds(), {
      $ifNull: ["$surveyFollowupUnsatisfied.firstRespondedAt", false]
    }),
    countUnsatisfiedFollowupRecontacted: buildProject(...baseUnsatisfiedConds(), {
      $eq: ["$unsatisfied.isRecontacted", true]
    }),

    // Setup MongoDB Projection For UNSATISFIED APV
    // touched
    countUnsatisfiedUntouchedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.touched', false],
    }),
    countUnsatisfiedUntouchedOpenApv: buildProject(
      ...baseUnsatisfiedConds(DataTypes.MAINTENANCE),
      { $eq: ['$unsatisfiedTicket.touched', false] },
      {
        $and: [
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    countUnsatisfiedTouchedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.touched', true],
    }),
    countUnsatisfiedTouchedOpenApv: buildProject(
      ...baseUnsatisfiedConds(DataTypes.MAINTENANCE),
      { $eq: ['$unsatisfiedTicket.touched', true] },
      {
        $and: [
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    countUnsatisfiedTouchedClosedApv: buildProject(
      ...baseUnsatisfiedConds(DataTypes.MAINTENANCE),
      { $eq: ['$unsatisfiedTicket.touched', true] },
      {
        $or: [
          { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    //
    countUnsatisfiedReactiveApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.reactive', true],
    }),
    countUnsatisfiedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE)),
    countUnsatisfiedAssignedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $and: [
        { $ne: ['$unsatisfiedTicket.manager', 'undefined'] },
        { $ne: ['$unsatisfiedTicket.manager', null] },
        { $ne: ['$unsatisfiedTicket.manager', undefined] },
        { $ne: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
      ],
    }),
    countUnsatisfiedOpenUnassignedApv: buildProject(
      ...baseUnsatisfiedConds(DataTypes.MAINTENANCE),
      {
        $or: [
          { $eq: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
          ...['undefined', null, undefined].map((e) => ({ $eq: ['$unsatisfiedTicket.manager', e] })),
        ],
      },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] }
    ),
    countUnsatisfiedAllUnassignedApv: buildProject(
      ...baseUnsatisfiedConds(DataTypes.MAINTENANCE),
      {
        $or: [
          { $eq: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
          ...['undefined', null, undefined].map((e) => ({ $eq: ['$unsatisfiedTicket.manager', e] })),
        ],
      },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      {
        $allElementsTrue: {
          $map: {
            input: '$unsatisfiedTicket.actions',
            in: { $cond: { if: contactedCondition, then: false, else: true } },
          },
        },
      }
    ),
    countUnsatisfiedAllAssignedWithoutActionApv: buildProject(
      ...baseUnsatisfiedConds(DataTypes.MAINTENANCE),
      ...['undefined', null, undefined].map((e) => ({ $ne: ['$unsatisfiedTicket.manager', e] })),
      { $ne: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      {
        $allElementsTrue: {
          $map: {
            input: '$unsatisfiedTicket.actions',
            in: { $cond: { if: contactedCondition, then: false, else: true } },
          },
        },
      }
    ),
    countUnsatisfiedAllAlreadyContactedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $or: [
        { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        {
          $anyElementTrue: {
            $map: {
              input: '$unsatisfiedTicket.actions',
              in: { $cond: { if: contactedCondition, then: true, else: false } },
            },
          },
        },
      ],
    }),
    countUnsatisfiedWaitingForContactApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_CONTACT],
    }),
    countUnsatisfiedContactPlannedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CONTACT_PLANNED],
    }),
    countUnsatisfiedWaitingForVisitApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_VISIT],
    }),
    countUnsatisfiedVisitPlannedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.VISIT_PLANNED],
    }),
    countUnsatisfiedWaitingForClosingApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_CLOSING],
    }),
    countUnsatisfiedClosedWithoutResolutionApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION],
    }),
    countUnsatisfiedClosedWithResolutionApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION],
    }),

    countUnsatisfiedFollowupRespondedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $ifNull: ["$surveyFollowupUnsatisfied.firstRespondedAt", false]
    }),
    countUnsatisfiedFollowupRecontactedApv: buildProject(...baseUnsatisfiedConds(DataTypes.MAINTENANCE), {
      $eq: ["$unsatisfied.isRecontacted", true]
    }),

    // Setup MongoDB Projection For UNSATISFIED VO
    // touched
    countUnsatisfiedUntouchedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.touched', false],
    }),
    countUnsatisfiedUntouchedOpenVo: buildProject(
      ...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE),
      { $eq: ['$unsatisfiedTicket.touched', false] },
      {
        $and: [
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    countUnsatisfiedTouchedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.touched', true],
    }),
    countUnsatisfiedTouchedOpenVo: buildProject(
      ...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE),
      { $eq: ['$unsatisfiedTicket.touched', true] },
      {
        $and: [
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    countUnsatisfiedTouchedClosedVo: buildProject(
      ...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE),
      { $eq: ['$unsatisfiedTicket.touched', true] },
      {
        $or: [
          { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    //
    countUnsatisfiedReactiveVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.reactive', true],
    }),
    countUnsatisfiedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE)),
    countUnsatisfiedAssignedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $and: [
        { $ne: ['$unsatisfiedTicket.manager', 'undefined'] },
        { $ne: ['$unsatisfiedTicket.manager', null] },
        { $ne: ['$unsatisfiedTicket.manager', undefined] },
        { $ne: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
      ],
    }),
    countUnsatisfiedOpenUnassignedVo: buildProject(
      ...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE),
      {
        $or: [
          { $eq: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
          ...['undefined', null, undefined].map((e) => ({ $eq: ['$unsatisfiedTicket.manager', e] })),
        ],
      },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] }
    ),
    countUnsatisfiedAllUnassignedVo: buildProject(
      ...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE),
      {
        $or: [
          { $eq: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
          ...['undefined', null, undefined].map((e) => ({ $eq: ['$unsatisfiedTicket.manager', e] })),
        ],
      },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      {
        $allElementsTrue: {
          $map: {
            input: '$unsatisfiedTicket.actions',
            in: { $cond: { if: contactedCondition, then: false, else: true } },
          },
        },
      }
    ),
    countUnsatisfiedAllAssignedWithoutActionVo: buildProject(
      ...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE),
      ...['undefined', null, undefined].map((e) => ({ $ne: ['$unsatisfiedTicket.manager', e] })),
      { $ne: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      {
        $allElementsTrue: {
          $map: {
            input: '$unsatisfiedTicket.actions',
            in: { $cond: { if: contactedCondition, then: false, else: true } },
          },
        },
      }
    ),
    countUnsatisfiedAllAlreadyContactedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $or: [
        { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        {
          $anyElementTrue: {
            $map: {
              input: '$unsatisfiedTicket.actions',
              in: { $cond: { if: contactedCondition, then: true, else: false } },
            },
          },
        },
      ],
    }),
    countUnsatisfiedWaitingForContactVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_CONTACT],
    }),
    countUnsatisfiedContactPlannedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CONTACT_PLANNED],
    }),
    countUnsatisfiedWaitingForVisitVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_VISIT],
    }),
    countUnsatisfiedVisitPlannedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.VISIT_PLANNED],
    }),
    countUnsatisfiedWaitingForClosingVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_CLOSING],
    }),
    countUnsatisfiedClosedWithoutResolutionVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION],
    }),
    countUnsatisfiedClosedWithResolutionVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION],
    }),

    countUnsatisfiedFollowupRespondedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $ifNull: ["$surveyFollowupUnsatisfied.firstRespondedAt", false]
    }),
    countUnsatisfiedFollowupRecontactedVo: buildProject(...baseUnsatisfiedConds(DataTypes.USED_VEHICLE_SALE), {
      $eq: ["$unsatisfied.isRecontacted", true]
    }),

    // Setup MongoDB Projection For UNSATISFIED VN
    // touched
    countUnsatisfiedUntouchedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.touched', false],
    }),
    countUnsatisfiedUntouchedOpenVn: buildProject(
      ...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE),
      { $eq: ['$unsatisfiedTicket.touched', false] },
      {
        $and: [
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    countUnsatisfiedTouchedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.touched', true],
    }),
    countUnsatisfiedTouchedOpenVn: buildProject(
      ...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE),
      { $eq: ['$unsatisfiedTicket.touched', true] },
      {
        $and: [
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    countUnsatisfiedTouchedClosedVn: buildProject(
      ...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE),
      { $eq: ['$unsatisfiedTicket.touched', true] },
      {
        $or: [
          { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] },
          { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        ],
      }
    ),
    //
    countUnsatisfiedReactiveVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.reactive', true],
    }),
    countUnsatisfiedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE)),
    countUnsatisfiedAssignedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $and: [
        { $ne: ['$unsatisfiedTicket.manager', 'undefined'] },
        { $ne: ['$unsatisfiedTicket.manager', null] },
        { $ne: ['$unsatisfiedTicket.manager', undefined] },
        { $ne: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
      ],
    }),
    countUnsatisfiedOpenUnassignedVn: buildProject(
      ...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE),
      {
        $or: [
          { $eq: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
          ...['undefined', null, undefined].map((e) => ({ $eq: ['$unsatisfiedTicket.manager', e] })),
        ],
      },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION] }
    ),
    countUnsatisfiedAllUnassignedVn: buildProject(
      ...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE),
      {
        $or: [
          { $eq: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
          ...['undefined', null, undefined].map((e) => ({ $eq: ['$unsatisfiedTicket.manager', e] })),
        ],
      },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      {
        $allElementsTrue: {
          $map: {
            input: '$unsatisfiedTicket.actions',
            in: { $cond: { if: contactedCondition, then: false, else: true } },
          },
        },
      }
    ),
    countUnsatisfiedAllAssignedWithoutActionVn: buildProject(
      ...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE),
      ...['undefined', null, undefined].map((e) => ({ $ne: ['$unsatisfiedTicket.manager', e] })),
      { $ne: [{ $type: '$unsatisfiedTicket.manager' }, 'missing'] },
      { $ne: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
      {
        $allElementsTrue: {
          $map: {
            input: '$unsatisfiedTicket.actions',
            in: { $cond: { if: contactedCondition, then: false, else: true } },
          },
        },
      }
    ),
    countUnsatisfiedAllAlreadyContactedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $or: [
        { $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION] },
        {
          $anyElementTrue: {
            $map: {
              input: '$unsatisfiedTicket.actions',
              in: { $cond: { if: contactedCondition, then: true, else: false } },
            },
          },
        },
      ],
    }),
    countUnsatisfiedWaitingForContactVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_CONTACT],
    }),
    countUnsatisfiedContactPlannedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CONTACT_PLANNED],
    }),
    countUnsatisfiedWaitingForVisitVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_VISIT],
    }),
    countUnsatisfiedVisitPlannedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.VISIT_PLANNED],
    }),
    countUnsatisfiedWaitingForClosingVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.WAITING_FOR_CLOSING],
    }),
    countUnsatisfiedClosedWithoutResolutionVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION],
    }),
    countUnsatisfiedClosedWithResolutionVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ['$unsatisfiedTicket.status', unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION],
    }),

    countUnsatisfiedFollowupRespondedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $ifNull: ["$surveyFollowupUnsatisfied.firstRespondedAt", false]
    }),
    countUnsatisfiedFollowupRecontactedVn: buildProject(...baseUnsatisfiedConds(DataTypes.NEW_VEHICLE_SALE), {
      $eq: ["$unsatisfied.isRecontacted", true]
    }),
  };

  // Setup MongoDB Grouping
  const $group =
    kpiType === KpiTypes.USER_KPI
      ? { _id: { garageId: '$garageId', userId: { $toString: '$userId' } } }
      : { _id: '$garageId' };
  for (const projection of Object.keys($project)) {
    if (!['garageId', 'userId'].includes(projection)) {
      $group[projection] = { $sum: `$${projection}` };
    }
  }
  const query = [{ $match }, { $project }, { $group }];

  // Getting Aggregation Result Directly From MongoDB
  return app.models.Data.getMongoConnector().aggregate(query).toArray();
};
