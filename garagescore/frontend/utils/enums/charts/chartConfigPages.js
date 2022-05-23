const ChartConfigPages = {
  "COCKPIT_LEADS_GARAGES": {
    "value": "cockpit-leads-garages",
    "properties": {
      "components": ["StatsLeadsUnprocessed", "StatsLeadsProcessed", "StatsLeadConverted"],
      "graphqlPath": "lead",
      "graphqlBuilderFunction": "buildRequestLeads"
    }
  },
  "COCKPIT_LEADS_TEAM": {
    "value": "cockpit-leads-team",
    "properties": {
      "components": ["StatsLeadsUnprocessed", "StatsLeadsProcessed", "StatsLeadConverted"],
      "graphqlPath": "lead",
      "graphqlBuilderFunction": "buildRequestLeads"
    }
  },
  "COCKPIT_LEADS_SOURCES": {
    "value": "cockpit-leads-sources",
    "properties": {
      "components": ["StatsLeadsUnprocessed", "StatsLeadsProcessed", "StatsLeadConverted"],
      "graphqlPath": "lead",
      "graphqlBuilderFunction": "buildRequestLeads"
    }
  },
  "COCKPIT_LEADS_FOLLOWED": {
    "value": "cockpit-leads-followed",
    "properties": {
      "components": ["StatsLeadsUnprocessed", "StatsLeadsProcessed", "StatsLeadConverted"],
      "graphqlPath": "lead",
      "graphqlBuilderFunction": "buildRequestLeads"
    }
  },
  "COCKPIT_UNSATISFIED_GARAGES": {
    "value": "cockpit-unsatisfied-garages",
    "properties": {
      "components": ["StatsUnsatisfiedUnprocessed", "StatsUnsatisfiedProcessed", "StatsUnsatisfiedSaved"],
      "graphqlPath": "unsatisfied",
      "graphqlBuilderFunction": "buildRequestUnsatisfied"
    }
  },
  "COCKPIT_UNSATISFIED_TEAM": {
    "value": "cockpit-unsatisfied-team",
    "properties": {
      "components": ["StatsUnsatisfiedUnprocessed", "StatsUnsatisfiedProcessed", "StatsUnsatisfiedSaved"],
      "graphqlPath": "unsatisfied",
      "graphqlBuilderFunction": "buildRequestUnsatisfied"
    }
  },
  "COCKPIT_SATISFACTION_GARAGES": {
    "value": "cockpit-satisfaction-garages",
    "properties": {
      "components": ["StatsNPS", "StatsPromotors", "StatsDetractors"],
      "graphqlPath": "satisfaction",
      "graphqlBuilderFunction": "buildRequestSatisfaction"
    }
  },
  "COCKPIT_SATISFACTION_TEAM": {
    "value": "cockpit-satisfaction-team",
    "properties": {
      "components": ["StatsNPS", "StatsPromotors", "StatsDetractors"],
      "graphqlPath": "satisfaction",
      "graphqlBuilderFunction": "buildRequestSatisfaction"
    }
  },
  "COCKPIT_SATISFACTION_REVIEWS": {
    "value": "cockpit-satisfaction-reviews",
    "properties": {
      "components": ["StatsNPS", "StatsPromotors", "StatsDetractors"],
      "graphqlPath": "satisfaction",
      "graphqlBuilderFunction": "buildRequestSatisfaction"
    }
  },
  "COCKPIT_CONTACTS_GARAGES": {
    "value": "cockpit-contacts-garages",
    "properties": {
      "components": ["StatsResponded", "StatsValidEmails", "StatsNotContactable"],
      "graphqlPath": "contacts",
      "graphqlBuilderFunction": "buildRequestContact"
    }
  },
  "COCKPIT_CONTACTS_TEAM": {
    "value": "cockpit-contacts-team",
    "properties": {
      "components": ["StatsResponded", "StatsValidEmails", "StatsNotContactable"],
      "graphqlPath": "contacts",
      "graphqlBuilderFunction": "buildRequestContact"
    }
  },
  "COCKPIT_CONTACTS_REVIEWS": {
    "value": "cockpit-contacts-reviews",
    "properties": {
      "components": ["StatsResponded", "StatsValidEmails", "StatsNotContactable"],
      "graphqlPath": "contacts",
      "graphqlBuilderFunction": "buildRequestContact"
    }
  },
  "COCKPIT_E_REPUTATION_GARAGES": {
    "value": "cockpit-e-reputation-garages",
    "properties": {
      "components": [
        "EreputationTileGarageScore",
        "EreputationTileGoogle",
        "EreputationTileFacebook",
        "EreputationTilePagesJaunes"
      ],
      "graphqlPath": "ereputation",
      "graphqlBuilderFunction": "buildRequestEreputation"
    }
  },
  "COCKPIT_E_REPUTATION_REVIEWS": {
    "value": "cockpit-e-reputation-reviews",
    "properties": {
      "components": [
        "EreputationTileGarageScore",
        "EreputationTileGoogle",
        "EreputationTileFacebook",
        "EreputationTilePagesJaunes"
      ],
      "graphqlPath": "ereputation",
      "graphqlBuilderFunction": "buildRequestEreputation"
    }
  },
  "COCKPIT_AUTOMATION_GARAGES": {
    "value": "cockpit-automation-garages",
    "properties": {
      "components": ["StatsAutomationSent", "StatsAutomationOpened", "StatsAutomationConverted", "StatsAutomationLead"]
    }
  },
  "COCKPIT_AUTOMATION_CAMPAIGNS": {
    "value": "cockpit-automation-campaigns",
    "properties": {
      "components": ["StatsAutomationSent", "StatsAutomationOpened", "StatsAutomationConverted", "StatsAutomationLead"]
    }
  }
}

module.exports = ChartConfigPages;
