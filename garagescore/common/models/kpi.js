const loopback = require('loopback');
const MongoObjectID = require('mongodb').ObjectID;

const kpiProxyMixin = require('../mixins/kpi-proxy');
const KpiDictionary = require('../lib/garagescore/kpi/KpiDictionary');
const kpiPeriods = require('../lib/garagescore/kpi/KpiPeriods');
const kpiType = require('./kpi-type');

const { TicketActionNames } = require('../../frontend/utils/enumV2');
const GarageTypes = require('./garage.type');
const DataTypes = require('./data/type/data-types');
const LeadTypes = require('./data/type/lead-types');
const leadTicketStatus = require('./data/type/lead-ticket-status');
const unsatisfiedTicketStatus = require('./data/type/unsatisfied-ticket-status');
const reminderStatus = require('./data/type/userActions/reminder-status.js');
// const commonTicket = require('./data/_common-ticket');
// const { log, TIBO } = require('../lib/util/log');

//
// BASE MODEL DEFINITION
//
const kpiBaseModel = {
  name: 'Kpi',
  base: 'GarageScoreBaseModel',
  mixins: {
    EventEmitter: true,
    Stream: true,
    FindWithProjection: true,
    MongoDirect: { whereBuildAddons: true },
    SmartSort: true,
    Timestamp: false,
    //Kpiproxy: true
  },
  properties: {
    [KpiDictionary.garageId]: { type: Object, required: true },
    [KpiDictionary.userId]: { type: Object, required: true, default: -1 },
    [KpiDictionary.kpiType]: { type: Number, required: true },
    [KpiDictionary.garageType]: { type: Number, required: true },
    [KpiDictionary.sourceType]: { type: String, required: true, default: -1 },
    [KpiDictionary.period]: { type: Number, required: true },
    [KpiDictionary.automationCampaignId]: { type: Number, required: true, default: -1 },
  },
  indexes: {
    garageId: { [KpiDictionary.garageId]: -1 },
    userId: { [KpiDictionary.userId]: -1 },
    automationCampaignId: { [KpiDictionary.automationCampaignId]: -1 },
    kpiType: { [KpiDictionary.kpiType]: -1 },
    garageType: { [KpiDictionary.garageType]: -1 },
    sourceType: { [KpiDictionary.sourceType]: -1 },
    period: { [KpiDictionary.period]: -1 },
    cockpit_kpi_lists: {
      [KpiDictionary.kpiType]: 1,
      [KpiDictionary.period]: -1,
      [KpiDictionary.garageType]: -1,
    },
    monthlySummary_index: {
      [KpiDictionary.kpiType]: 1,
      [KpiDictionary.garageId]: -1,
      [KpiDictionary.period]: -1,
    },
    dontEraseZero: {
      keys: {
        [KpiDictionary.garageId]: -1,
        [KpiDictionary.userId]: -1,
        [KpiDictionary.kpiType]: -1,
        [KpiDictionary.garageType]: -1,
        [KpiDictionary.period]: -1,
        [KpiDictionary.sourceType]: -1,
        [KpiDictionary.automationCampaignId]: -1,
      },
      options: {
        unique: true,
      },
    },
  },
};

//
// BY PERIOD DEFINITION
//
const kpiByPeriod = {
  name: 'KpiByPeriod',
  plural: 'KpisByPeriod',
  base: 'Kpi',
  description: 'Flat key encoded KPIs consolidated by periods',
  mongodb: { collection: 'kpiByPeriod', settings: { mongodb: { allowExtendedOperators: true } } },
  http: { path: 'kpi-by-period' },
};

//
// BY PERIOD BACKUP DEFINITION
//
const kpiByPeriodBackup = {
  name: 'KpiByPeriodBackup',
  plural: 'KpisByPeriodBackup',
  base: 'Kpi',
  description: 'Flat key encoded KPIs consolidated by periods',
  mongodb: { collection: 'kpiByPeriodBackup', settings: { mongodb: { allowExtendedOperators: true } } },
  http: { path: 'kpi-by-period-backup' },
};

//
// CALLED BY LOOPBACK ON STARTUP
//
function KpiDefinition(app) {
  const modelConfig = { dataSource: 'garagescoreMongoDataSource', public: true };

  // 1. Register the KPI base model
  const Kpi = app.model(loopback.createModel(kpiBaseModel), modelConfig);
  kpiProxyMixin(Kpi);

  // 3. Register the KpiByPeriod model
  const KpiByPeriod = app.model(loopback.createModel(kpiByPeriod), modelConfig);
  kpiProxyMixin(KpiByPeriod);

  // 5. Register the KpiByPeriod Backup
  const KpiByPeriodBackup = app.model(loopback.createModel(kpiByPeriodBackup), modelConfig);
  kpiProxyMixin(KpiByPeriodBackup);

  // ///////////////////////////////// //
  //       4. Register Methods         //
  // ///////////////////////////////// //

  Kpi._log = KpiByPeriod._log = function _log(incId, incDate, type, origin, data, msg) {
    const baseLog = `[KPI/INC] [Id: ${incId}] [Timestamp: ${incDate.valueOf()}] [TicketType: ${type}] [Origin: ${origin}] [DataId: ${data.id.toString()}] [GarageId: ${
      data.garageId
    }] |`; // eslint-disable-line
    const showLog = process.env.SHOW_KPIS_LOG === 'true' || process.env.SHOW_KPIS_LOG === true;

    if (showLog) {
      console.log(`${baseLog} ${msg}`);
    }
  };

  Kpi.createSnapshot = KpiByPeriod.createSnapshot = async function createSnapshot(type, data) {
    const ticket = data.get(`${type}Ticket`) || {};
    const managerId =
      data.get(`${type}Ticket.manager`) !== 'undefined' ? data.get(`${type}Ticket.manager`) || null : null;
    const sourceType = data.get('source.type');
    const touchedStatus = ticket && ticket.touched ? 'Touched' : 'Untouched';
    const reactive = ticket && ticket.reactive;
    const fields = [];
    const garages = [{ id: data.get('garageId'), fields: [], kpiType: kpiType.GARAGE_KPI }];
    const sources = [
      {
        id: sourceType,
        garageId: data.get('garageId'),
        fields: [],
        kpiType: kpiType.SOURCE_KPI,
        sourceType, // SourceTypes.typeToInt(sourceType),
      },
    ];
    const users = managerId
      ? [{ id: managerId, garageId: data.get('garageId'), fields: [], kpiType: kpiType.USER_KPI }]
      : [];
    const followed = [{ id: data.get('source.garageId'), fields: [], kpiType: kpiType.AGENT_GARAGE_KPI }];
    const snapshot = { garages, users, followed, sources };
    const hasMeaningfulAction =
      ticket.actions &&
      ticket.actions.some(
        (action) =>
          [TicketActionNames.GARAGE_SECOND_VISIT, TicketActionNames.CUSTOMER_CALL].includes(action.name) ||
          (action.name === TicketActionNames.REMINDER &&
            action.reminderActionName === TicketActionNames.GARAGE_SECOND_VISIT &&
            action.reminderStatus !== reminderStatus.CANCELLED) ||
          (action.name === TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED && action.followupIsRecontacted === true)
      );
    const lastActionName = ticket.actions && ticket.actions.slice(-1).pop().name;

    if (ticket && type === 'lead') {
      fields.push('countLeads');
      //
      // Leads Touched and Untouched
      //
      fields.push(`countLeads${touchedStatus}`);
      if (
        ticket.status === leadTicketStatus.CLOSED_WITH_SALE ||
        ticket.status === leadTicketStatus.CLOSED_WITHOUT_SALE
      ) {
        fields.push(`countLeads${touchedStatus}Closed`);
      } else {
        fields.push(`countLeads${touchedStatus}Open`);
      }
      //
      //
      if (
        (!ticket.manager || ticket.manager === 'undefined') &&
        ticket.status !== leadTicketStatus.CLOSED_WITH_SALE &&
        ticket.status !== leadTicketStatus.CLOSED_WITHOUT_SALE
      )
        fields.push('countLeadsUnassigned');
      if (ticket.manager && ticket.manager !== 'undefined') fields.push('countLeadsAssigned');
      if (ticket.status === leadTicketStatus.WAITING_FOR_CONTACT) fields.push('countLeadsWaitingForContact');
      if (ticket.status === leadTicketStatus.CONTACT_PLANNED) fields.push('countLeadsContactPlanned');
      if (ticket.status === leadTicketStatus.WAITING_FOR_MEETING) fields.push('countLeadsWaitingForMeeting');
      if (ticket.status === leadTicketStatus.MEETING_PLANNED) fields.push('countLeadsMeetingPlanned');
      if (ticket.status === leadTicketStatus.WAITING_FOR_PROPOSITION) fields.push('countLeadsWaitingForProposition');
      if (ticket.status === leadTicketStatus.PROPOSITION_PLANNED) fields.push('countLeadsPropositionPlanned');
      if (ticket.status === leadTicketStatus.WAITING_FOR_CLOSING) fields.push('countLeadsWaitingForClosing');
      if (ticket.status === leadTicketStatus.CLOSED_WITHOUT_SALE) fields.push('countLeadsClosedWithoutSale');
      if (ticket.status === leadTicketStatus.CLOSED_WITH_SALE) fields.push('countLeadsClosedWithSale');

      if (ticket.status === leadTicketStatus.CLOSED_WITH_SALE && ticket.saleType === DataTypes.MAINTENANCE) {
        fields.push('countLeadsClosedWithSaleApv');
      }
      if (ticket.status === leadTicketStatus.CLOSED_WITH_SALE && ticket.saleType === DataTypes.USED_VEHICLE_SALE) {
        fields.push('countLeadsClosedWithSaleVo');
      }
      if (
        ticket.status === leadTicketStatus.CLOSED_WITH_SALE &&
        (ticket.saleType === DataTypes.NEW_VEHICLE_SALE || ticket.saleType === DataTypes.UNKNOWN || !ticket.saleType)
      ) {
        fields.push('countLeadsClosedWithSaleVn');
      }
      if (ticket.status === leadTicketStatus.CLOSED_WITH_SALE && data.get('lead.type') === LeadTypes.INTERESTED) {
        fields.push('countLeadsClosedWithSaleWasInterested');
      }
      if (
        ticket.status === leadTicketStatus.CLOSED_WITH_SALE &&
        data.get('lead.type') === LeadTypes.IN_CONTACT_WITH_VENDOR
      ) {
        fields.push('countLeadsClosedWithSaleWasInContactWithVendor');
      }
      if (
        ticket.status === leadTicketStatus.CLOSED_WITH_SALE &&
        data.get('lead.type') === LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS
      ) {
        fields.push('countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness');
      }
      if (reactive) fields.push('countLeadsReactive');
    } else if (ticket && type === 'unsatisfied') {
      let unsatisfiedType = null;
      if (ticket.type === DataTypes.MAINTENANCE) unsatisfiedType = 'Apv';
      else if (ticket.type === DataTypes.NEW_VEHICLE_SALE) unsatisfiedType = 'Vn';
      else if (ticket.type === DataTypes.USED_VEHICLE_SALE) unsatisfiedType = 'Vo';
      fields.push('countUnsatisfied');
      //
      // Unsatisfied Touched and Untouched
      //
      fields.push(`countUnsatisfied${touchedStatus}`);
      if (unsatisfiedType) fields.push(`countUnsatisfied${touchedStatus}${unsatisfiedType}`);
      if (
        ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION ||
        ticket.status === unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION
      ) {
        fields.push(`countUnsatisfied${touchedStatus}Closed`);
        if (unsatisfiedType) fields.push(`countUnsatisfied${touchedStatus}Closed${unsatisfiedType}`);
      } else {
        fields.push(`countUnsatisfied${touchedStatus}Open`);
        if (unsatisfiedType) fields.push(`countUnsatisfied${touchedStatus}Open${unsatisfiedType}`);
      }
      //
      //
      if (reactive) fields.push('countUnsatisfiedReactive');
      if (unsatisfiedType && reactive) fields.push(`countUnsatisfiedReactive${unsatisfiedType}`);

      if (!ticket.manager || ticket.manager === 'undefined') {
        if (
          ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION &&
          ticket.status !== unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION
        )
          fields.push('countUnsatisfiedOpenUnassigned');
        if (ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION && !hasMeaningfulAction)
          fields.push('countUnsatisfiedAllUnassigned');
      }
      if (ticket.manager && ticket.manager !== 'undefined') {
        fields.push('countUnsatisfiedAssigned');
        if (ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION && !hasMeaningfulAction)
          fields.push('countUnsatisfiedAllAssignedWithoutAction');
      }
      if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION || hasMeaningfulAction)
        fields.push('countUnsatisfiedAllAlreadyContacted');
      if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_CONTACT)
        fields.push('countUnsatisfiedWaitingForContact');
      if (ticket.status === unsatisfiedTicketStatus.CONTACT_PLANNED) fields.push('countUnsatisfiedContactPlanned');
      if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_VISIT) fields.push('countUnsatisfiedWaitingForVisit');
      if (ticket.status === unsatisfiedTicketStatus.VISIT_PLANNED) fields.push('countUnsatisfiedVisitPlanned');
      if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_CLOSING)
        fields.push('countUnsatisfiedWaitingForClosing');
      if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION)
        fields.push('countUnsatisfiedClosedWithoutResolution');
      if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION)
        fields.push('countUnsatisfiedClosedWithResolution');
      if (ticket.type === DataTypes.MAINTENANCE) {
        if (!ticket.manager || ticket.manager === 'undefined') {
          if (
            ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION &&
            ticket.status !== unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION
          )
            fields.push('countUnsatisfiedOpenUnassignedApv');
          if (ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION)
            fields.push('countUnsatisfiedAllUnassignedApv');
        }
        if (ticket.manager && ticket.manager !== 'undefined') {
          fields.push('countUnsatisfiedAssignedApv');
          if (ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION && !hasMeaningfulAction)
            fields.push('countUnsatisfiedAllAssignedWithoutActionApv');
        }
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION || hasMeaningfulAction)
          fields.push('countUnsatisfiedAllAlreadyContactedApv');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_CONTACT)
          fields.push('countUnsatisfiedWaitingForContactApv');
        if (ticket.status === unsatisfiedTicketStatus.CONTACT_PLANNED) fields.push('countUnsatisfiedContactPlannedApv');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_VISIT)
          fields.push('countUnsatisfiedWaitingForVisitApv');
        if (ticket.status === unsatisfiedTicketStatus.VISIT_PLANNED) fields.push('countUnsatisfiedVisitPlannedApv');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_CLOSING)
          fields.push('countUnsatisfiedWaitingForClosingApv');
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION)
          fields.push('countUnsatisfiedClosedWithoutResolutionApv');
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION)
          fields.push('countUnsatisfiedClosedWithResolutionApv');
      } else if (ticket.type === DataTypes.USED_VEHICLE_SALE) {
        if (!ticket.manager || ticket.manager === 'undefined') {
          if (
            ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION &&
            ticket.status !== unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION
          )
            fields.push('countUnsatisfiedOpenUnassignedVo');
          if (ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION)
            fields.push('countUnsatisfiedAllUnassignedVo');
        }
        if (ticket.manager && ticket.manager !== 'undefined') {
          fields.push('countUnsatisfiedAssignedVo');
          if (ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION && !hasMeaningfulAction)
            fields.push('countUnsatisfiedAllAssignedWithoutActionVo');
        }
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION || hasMeaningfulAction)
          fields.push('countUnsatisfiedAllAlreadyContactedVo');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_CONTACT)
          fields.push('countUnsatisfiedWaitingForContactVo');
        if (ticket.status === unsatisfiedTicketStatus.CONTACT_PLANNED) fields.push('countUnsatisfiedContactPlannedVo');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_VISIT)
          fields.push('countUnsatisfiedWaitingForVisitVo');
        if (ticket.status === unsatisfiedTicketStatus.VISIT_PLANNED) fields.push('countUnsatisfiedVisitPlannedVo');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_CLOSING)
          fields.push('countUnsatisfiedWaitingForClosingVo');
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION)
          fields.push('countUnsatisfiedClosedWithoutResolutionVo');
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION)
          fields.push('countUnsatisfiedClosedWithResolutionVo');
      } else if (ticket.type === DataTypes.NEW_VEHICLE_SALE) {
        if (!ticket.manager || ticket.manager === 'undefined') {
          if (
            ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION &&
            ticket.status !== unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION
          )
            fields.push('countUnsatisfiedOpenUnassignedVn');
          if (ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION)
            fields.push('countUnsatisfiedAllUnassignedVn');
        }
        if (ticket.manager && ticket.manager !== 'undefined') {
          fields.push('countUnsatisfiedAssignedVn');
          if (ticket.status !== unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION && !hasMeaningfulAction)
            fields.push('countUnsatisfiedAllAssignedWithoutActionVn');
        }
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION || hasMeaningfulAction)
          fields.push('countUnsatisfiedAllAlreadyContactedVn');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_CONTACT)
          fields.push('countUnsatisfiedWaitingForContactVn');
        if (ticket.status === unsatisfiedTicketStatus.CONTACT_PLANNED) fields.push('countUnsatisfiedContactPlannedVn');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_VISIT)
          fields.push('countUnsatisfiedWaitingForVisitVn');
        if (ticket.status === unsatisfiedTicketStatus.VISIT_PLANNED) fields.push('countUnsatisfiedVisitPlannedVn');
        if (ticket.status === unsatisfiedTicketStatus.WAITING_FOR_CLOSING)
          fields.push('countUnsatisfiedWaitingForClosingVn');
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION)
          fields.push('countUnsatisfiedClosedWithoutResolutionVn');
        if (ticket.status === unsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION)
          fields.push('countUnsatisfiedClosedWithResolutionVn');
      }
    }
    snapshot.garages.forEach((g) => g.fields.push(...fields));
    snapshot.users.forEach((u) => u.fields.push(...fields));
    snapshot.sources.forEach((s) => s.fields.push(...fields));
    if (followed[0].id) snapshot.followed.forEach((f) => f.fields.push(...fields));
    else delete snapshot.followed; // Create snapshot only if it's a shared lead
    return snapshot;
  };

  Kpi._mergeSnapshots = KpiByPeriod._mergeSnapshots = function _mergeSnapshots(newSnapshot = {}, oldSnapshot = {}) {
    const mergedSnapshot = { garages: [], users: [], followed: [], sources: [] };
    let oldEntity = null;
    let newEntity = null;
    let oldFields = [];

    for (const garage of newSnapshot.garages || []) {
      oldEntity = oldSnapshot.garages
        ? oldSnapshot.garages.find((g) => g.id.toString() === garage.id.toString())
        : null;
      oldFields = oldEntity ? oldEntity.fields : [];
      garage.inc = Kpi._mergeSnapshotFields(garage.fields, oldFields);
      mergedSnapshot.garages.push(garage);
    }

    for (const user of newSnapshot.users || []) {
      oldEntity = oldSnapshot.users ? oldSnapshot.users.find((u) => u.id.toString() === user.id.toString()) : null;
      oldFields = oldEntity ? oldEntity.fields : [];
      user.inc = Kpi._mergeSnapshotFields(user.fields, oldFields);
      mergedSnapshot.users.push(user);
    }

    for (const followed of newSnapshot.followed || []) {
      oldEntity = oldSnapshot.followed
        ? oldSnapshot.followed.find((f) => f.id.toString() === followed.id.toString())
        : null;
      oldFields = oldEntity ? oldEntity.fields : [];
      followed.inc = Kpi._mergeSnapshotFields(followed.fields, oldFields);
      mergedSnapshot.followed.push(followed);
    }

    for (const source of newSnapshot.sources || []) {
      oldEntity = oldSnapshot.sources
        ? oldSnapshot.sources.find(
            (s) => s.garageId.toString() === source.garageId.toString() && s.sourceType === source.sourceType
          )
        : null;
      oldFields = oldEntity ? oldEntity.fields : [];
      source.inc = Kpi._mergeSnapshotFields(source.fields, oldFields);
      mergedSnapshot.sources.push(source);
    }

    for (const garage of oldSnapshot.garages || []) {
      newEntity = newSnapshot.garages
        ? newSnapshot.garages.find((g) => g.id.toString() === garage.id.toString())
        : null;
      if (!newEntity) {
        garage.inc = Kpi._mergeSnapshotFields([], garage.fields);
        mergedSnapshot.garages.push(garage);
      }
    }

    for (const user of oldSnapshot.users || []) {
      newEntity = newSnapshot.users ? newSnapshot.users.find((u) => u.id.toString() === user.id.toString()) : null;
      if (!newEntity) {
        user.inc = Kpi._mergeSnapshotFields([], user.fields);
        mergedSnapshot.users.push(user);
      }
    }

    for (const followed of oldSnapshot.followed || []) {
      newEntity = newSnapshot.followed
        ? newSnapshot.followed.find((f) => f.id.toString() === followed.id.toString())
        : null;
      if (!newEntity) {
        followed.inc = Kpi._mergeSnapshotFields([], followed.fields);
        mergedSnapshot.followed.push(followed);
      }
    }

    for (const source of oldSnapshot.sources || []) {
      newEntity = newSnapshot.sources
        ? newSnapshot.sources.find(
            (s) => s.garageId.toString() === source.garageId.toString() && s.sourceType === source.sourceType
          )
        : null;
      if (!newEntity) {
        source.inc = Kpi._mergeSnapshotFields([], source.fields);
        mergedSnapshot.sources.push(source);
      }
    }

    return mergedSnapshot;
  };

  Kpi._mergeSnapshotFields = function _mergeSnapshotFields(newFields = [], oldField = []) {
    const increment = newFields.reduce(
      (acc, key) => ({ ...acc, ...(!oldField.includes(key) ? { [key]: 1 } : {}) }),
      {}
    );
    const decrement = oldField.reduce(
      (acc, key) => ({ ...acc, ...(!newFields.includes(key) ? { [key]: -1 } : {}) }),
      {}
    );

    return { ...increment, ...decrement };
  };

  Kpi._buildQuery = KpiByPeriod._buildQuery = function _buildQuery(type, data, mergedSnapshot) {
    const date = new Date(data.get(`${type}Ticket.createdAt`));
    const affectedPeriods = kpiPeriods.getPeriodsAffectedByGivenDate(date);
    const countAffectedKpis =
      affectedPeriods.length *
      (mergedSnapshot.garages.length +
        mergedSnapshot.users.length +
        mergedSnapshot.followed.length +
        mergedSnapshot.sources.length);
    const entities = [
      ...mergedSnapshot.garages,
      ...mergedSnapshot.users,
      ...mergedSnapshot.followed,
      ...mergedSnapshot.sources,
    ];

    // We loop through every garages and users concerned by the update and we build a loopback query
    for (const entity of entities) {
      entity.query = { byPeriod: {} };
      // 1. Setting garageId
      entity.query.byPeriod.garageId = entity.query.byPeriod.garageId = new MongoObjectID(entity.garageId || entity.id);
      // 2. Settings possible periods / specific day
      entity.query.byPeriod.or = affectedPeriods.filter((p) => !p.isDaily).map((p) => ({ period: p.token }));
      // 3. Setting garage specific query by default
      entity.query.byPeriod.kpiType = entity.query.byPeriod.kpiType = entity.kpiType;
      // 4. Setting user specific query
      if (entity.kpiType === kpiType.USER_KPI) {
        entity.query.byPeriod.userId = entity.query.byPeriod.userId = new MongoObjectID(entity.id);
      }
      // 5. Setting sourceType specific query
      if (entity.kpiType === kpiType.SOURCE_KPI) {
        entity.query.byPeriod.sourceType = entity.sourceType;
      }
    }

    return { countAffectedKpis, affectedPeriods, mergedSnapshot };
  };

  Kpi._createIfDoNotExist = async function _createIfDoNotExist(query) {
    const kpiBuffer = { byPeriod: [] };
    const entities = [
      ...query.mergedSnapshot.garages,
      ...query.mergedSnapshot.users,
      ...query.mergedSnapshot.followed,
      ...query.mergedSnapshot.sources,
    ];
    let garageId = null;
    let garage = null;
    let container = [];
    let buffer = [];
    const existingKpis = [];

    for (const entity of entities) {
      const existingKpisByPeriod = await KpiByPeriod.find({ where: { ...entity.query.byPeriod } });
      const getAlreadyExistingKpis = existingKpisByPeriod.map((e) => {
        e.collection = 'KpiByPeriod';
        return e;
      });
      existingKpis.push(...getAlreadyExistingKpis);
      if (query.affectedPeriods.length > existingKpisByPeriod.length) {
        for (const period of query.affectedPeriods) {
          container = existingKpisByPeriod;
          buffer = kpiBuffer.byPeriod;
          if (
            !container.find(
              (k) =>
                k.period === period.token &&
                k.kpiType === entity.kpiType &&
                k.garageId.toString() === (entity.garageId || entity.id) &&
                (entity.kpiType === kpiType.GARAGE_KPI || (k.userId && k.userId.toString() === entity.id))
            )
          ) {
            garageId = entity.garageId || entity.id;
            garage = garage && garage.id.toString() === garageId ? garage : await app.models.Garage.findById(garageId);
            buffer.push({
              // Every fields listed below should be in "_dontEraseZero" function
              garageId: new MongoObjectID(garageId),
              kpiType: entity.kpiType,
              period: period.token,
              garageType: GarageTypes.getIntegerVersion(garage.type),
              ...(entity.kpiType === kpiType.USER_KPI ? { userId: new MongoObjectID(entity.id) } : {}),
              ...(entity.kpiType === kpiType.SOURCE_KPI ? { sourceType: entity.sourceType } : {}),
            });
          }
        }
      }
    }
    const created = kpiBuffer.byPeriod.length;
    if (kpiBuffer.byPeriod.length) {
      let newValues = await app.models.KpiByPeriod.create(kpiBuffer.byPeriod);
      newValues = newValues.map((e) => {
        e.collection = 'KpiByPeriod';
        return e;
      });
      existingKpis.push(...newValues);
    }
    return {
      existingKpis,
      created,
    };
  };

  Kpi.destroyAllUserKpi = async function destroyAllUserKpi(userId, garageIds = null) {
    const garageIdQuery = { garageId: { inq: garageIds ? garageIds.map((id) => new MongoObjectID(id)) : [] } };

    await KpiByPeriod.destroyAll({ userId: new MongoObjectID(userId), ...(garageIds ? garageIdQuery : {}) });
  };
}

module.exports = KpiDefinition;
