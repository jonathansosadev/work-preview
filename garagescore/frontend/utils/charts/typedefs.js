/* Don't be afraid , most of it has been auto-generated :) */

//--------------------------------------------------------------------------------------//
//                                         Misc                                         //
//--------------------------------------------------------------------------------------//

/** @typedef {String} GHPeriod - a period in GarageHistory format*/
/** @typedef {String} HexColor - a color in hex format */

//--------------------------------------------------------------------------------------//
//                          Local Storage Chart Configuration                           //
//--------------------------------------------------------------------------------------//

/**
 * @typedef {Object} Chart_LocalStorageChartConfiguration - same as the full configuration but we only save the component view
 * @property {{StatsLeadsUnprocessed : Chart_LocalStorageComponent, StatsLeadsProcessed : Chart_LocalStorageComponent, StatsLeadConverted : Chart_LocalStorageComponent}} cockpit-leads-garages
 * @property {{StatsLeadsUnprocessed : Chart_LocalStorageComponent, StatsLeadsProcessed : Chart_LocalStorageComponent, StatsLeadConverted : Chart_LocalStorageComponent}} cockpit-leads-team
 * @property {{StatsLeadsUnprocessed : Chart_LocalStorageComponent, StatsLeadsProcessed : Chart_LocalStorageComponent, StatsLeadConverted : Chart_LocalStorageComponent}} cockpit-leads-sources
 * @property {{StatsLeadsUnprocessed : Chart_LocalStorageComponent, StatsLeadsProcessed : Chart_LocalStorageComponent, StatsLeadConverted : Chart_LocalStorageComponent}} cockpit-leads-followed
 * @property {{StatsUnsatisfiedUnprocessed : Chart_LocalStorageComponent, StatsUnsatisfiedProcessed : Chart_LocalStorageComponent, StatsUnsatisfiedSaved : Chart_LocalStorageComponent}} cockpit-unsatisfied-garages
 * @property {{StatsUnsatisfiedUnprocessed : Chart_LocalStorageComponent, StatsUnsatisfiedProcessed : Chart_LocalStorageComponent, StatsUnsatisfiedSaved : Chart_LocalStorageComponent}}  cockpit-unsatisfied-team
 * @property {{StatsNPS : Chart_LocalStorageComponent, StatsPromotors : Chart_LocalStorageComponent, StatsDetractors : Chart_LocalStorageComponent}} cockpit-satisfaction-garages
 * @property {{StatsNPS : Chart_LocalStorageComponent, StatsPromotors : Chart_LocalStorageComponent, StatsDetractors : Chart_LocalStorageComponent}} cockpit-satisfaction-team
 * @property {{StatsNPS : Chart_LocalStorageComponent, StatsPromotors : Chart_LocalStorageComponent, StatsDetractors : Chart_LocalStorageComponent}}cockpit-satisfaction-reviews
 * @property {{StatsResponded : Chart_LocalStorageComponent, StatsValidEmails : Chart_LocalStorageComponent, StatsNotContactable : Chart_LocalStorageComponent}} cockpit-contacts-garages
 * @property {{StatsResponded : Chart_LocalStorageComponent, StatsValidEmails : Chart_LocalStorageComponent, StatsNotContactable : Chart_LocalStorageComponent}} cockpit-contacts-team
 * @property {{StatsResponded : Chart_LocalStorageComponent, StatsValidEmails : Chart_LocalStorageComponent, StatsNotContactable : Chart_LocalStorageComponent}} cockpit-contacts-reviews
 * @property {{EreputationTileGaragescore : Chart_LocalStorageComponent, EreputationTileGoogle : Chart_LocalStorageComponent, EreputationTileFacebook : Chart_LocalStorageComponent, EreputationTilePagesJaunes : Chart_LocalStorageComponent}} cockpit-e-reputation-garages
 * @property {{EreputationTileGaragescore : Chart_LocalStorageComponent, EreputationTileGoogle : Chart_LocalStorageComponent, EreputationTileFacebook : Chart_LocalStorageComponent, EreputationTilePagesJaunes : Chart_LocalStorageComponent}} cockpit-e-reputation-reviews
 * @property {{StatsAutomationSent : Chart_LocalStorageComponent, StatsAutomationOpened : Chart_LocalStorageComponent, StatsAutomationConverted : Chart_LocalStorageComponent, StatsAutomationLead : Chart_LocalStorageComponent}}cockpit-automation-garages
 * @property {{StatsAutomationSent : Chart_LocalStorageComponent, StatsAutomationOpened : Chart_LocalStorageComponent, StatsAutomationConverted : Chart_LocalStorageComponent, StatsAutomationLead : Chart_LocalStorageComponent}} cockpit-automation-campaigns
 */

/**
 * @typedef {Object} Chart_LocalStorageComponent
 * @property {Enum_ChartConfigViews} view
 */

//--------------------------------------------------------------------------------------//
//                               Full Chart Configuration                               //
//--------------------------------------------------------------------------------------//

/**
 * @typedef {Object} CHART_CONFIGURATION - full chart configuration
 * @property {boolean} shouldRefreshData - used in the store to indicate that top filters has changed and chart data should be fetched again
 * @property {GHPeriod[]} ghPeriods - array of GarageHistory Periods (months)
 * @property {Chart_LabelsConfig} config - chart labels configuration
 * @property {Chart_PagesConfig} components - object that contains all pages chart configuration
 */

/**
 * @typedef {Object} Chart_LabelsConfig - labels configuration shared between all chart pages configuration
 * @property {GHPeriod[]} labels - periods displayed in axis X
 * @property {HexColor[]} labelsColors - used to color each element displayed in the chart (HexColor array)
 */

/**
 * @typedef {Object} Chart_PagesConfig - object that contains all pages chart configuration (enum : frontend/utils/enums/charts/chartConfigPages.js)
 * @property {CockpitLeadsGarages} cockpit-leads-garages
 * @property {CockpitLeadsTeam} cockpit-leads-team
 * @property {CockpitLeadsSources} cockpit-leads-sources
 * @property {CockpitLeadsFollowed} cockpit-leads-followed
 * @property {CockpitUnsatisfiedGarages} cockpit-unsatisfied-garages
 * @property {CockpitUnsatisfiedTeam} cockpit-unsatisfied-team
 * @property {CockpitSatisfactionGarages} cockpit-satisfaction-garages
 * @property {CockpitSatisfactionTeam} cockpit-satisfaction-team
 * @property {CockpitSatisfactionReviews} cockpit-satisfaction-reviews
 * @property {CockpitContactsGarages} cockpit-contacts-garages
 * @property {CockpitContactsTeam} cockpit-contacts-team
 * @property {CockpitContactsReviews} cockpit-contacts-reviews
 * @property {CockpitEReputationGarages} cockpit-e-reputation-garages
 * @property {CockpitEReputationReviews} cockpit-e-reputation-reviews
 * @property {CockpitAutomationGarages} cockpit-automation-garages
 * @property {CockpitAutomationCampaigns} cockpit-automation-campaigns
 */

/**
 * @typedef {Object} Chart_ComponentConfig - Configuration for a specific component inside a page
 * @property {String} loading - the chart component loading state
 * @property {Enum_ChartConfigViews} view - the chart component view state (either "chart" or "kpi")
 * @property {number=} stepSize - chart.js config element {@link https://www.chartjs.org/docs/2.9.3/axes/cartesian/linear.html?h=stepsize}
 * @property {number=} min - chart.js config element {@link https://www.chartjs.org/docs/2.9.3/axes/cartesian/?h=min}
 * @property {number=} max - chart.js config element {@link https://www.chartjs.org/docs/2.9.3/axes/cartesian/?h=max}
 * @property {number=} suggestedMin - chart.js config element {@link https://www.chartjs.org/docs/2.9.3/axes/cartesian/linear.html?h=suggestedMin}
 * @property {number=} suggestedMax - chart.js config element {@link https://www.chartjs.org/docs/2.9.3/axes/cartesian/linear.html?h=suggestedMax}
 * @property {String} format - Predefined format (enum : {@link frontend/utils/enums/charts/chartConfigFormats.json}), used to round values and to display % or not
 * @property {String} field - A component fieldName
 * @property {String} generalStatsLabel - The name of the generalStats key
 * @property {Chart_Target} target - config element for the field we want to display in the bar of the chart. corresponds to a Kpi bloc in cockpit
 * @property {Chart_Global=} global - config element to display the Global stats in the chart (optional , not used in Erep or Automation)
 * @property {Chart_Top200=} top200 - config element to display the Top200 stats in the chart (optional , not used in Erep or Automation)
 */

/**
 * @typedef {Object} Chart_Target - A Chart has 3 element : target (bar) , top200 (line), global(line). target corresponds to the bar in the chart.
 * @property {string} label - The name of the field to display in the chart legend
 * @property {number[]} dataSet - The data that will be displayed in the chart
 * @property {HexColor[]} backgroundColor - Used to color each element of the bar (HexColor array)
 */
/**
 * @typedef {Object} Chart_Global - A Chart has 3 element : target (bar) , top200 (line), global(line). global corresponds to the line in the chart.
 * @property {number[]} dataSet - The data that will be displayed in the chart
 */
/**
 * @typedef {Object} Chart_Top200 - A Chart has 3 element : target (bar) , top200 (line), global(line). top200 corresponds to the line in the chart.
 * @property {number[]} dataSet - The data that will be displayed in the chart
 */

/**
 * @typedef {Object} CockpitLeadsGarages - Chart page configuration for page CockpitLeadsGarages
 * @property {Chart_ComponentConfig} StatsLeadsUnprocessed - Chart component configuration for component StatsLeadsUnprocessed
 * @property {Chart_ComponentConfig} StatsLeadsProcessed - Chart component configuration for component StatsLeadsProcessed
 * @property {Chart_ComponentConfig} StatsLeadConverted - Chart component configuration for component StatsLeadConverted
 */

/**
 * @typedef {Object} CockpitLeadsTeam - Chart page configuration for page CockpitLeadsTeam
 * @property {Chart_ComponentConfig} StatsLeadsUnprocessed - Chart component configuration for component StatsLeadsUnprocessed
 * @property {Chart_ComponentConfig} StatsLeadsProcessed - Chart component configuration for component StatsLeadsProcessed
 * @property {Chart_ComponentConfig} StatsLeadConverted - Chart component configuration for component StatsLeadConverted
 */

/**
 * @typedef {Object} CockpitLeadsSources - Chart page configuration for page CockpitLeadsSources
 * @property {Chart_ComponentConfig} StatsLeadsUnprocessed - Chart component configuration for component StatsLeadsUnprocessed
 * @property {Chart_ComponentConfig} StatsLeadsProcessed - Chart component configuration for component StatsLeadsProcessed
 * @property {Chart_ComponentConfig} StatsLeadConverted - Chart component configuration for component StatsLeadConverted
 */

/**
 * @typedef {Object} CockpitLeadsFollowed - Chart page configuration for page CockpitLeadsFollowed
 * @property {Chart_ComponentConfig} StatsLeadsUnprocessed - Chart component configuration for component StatsLeadsUnprocessed
 * @property {Chart_ComponentConfig} StatsLeadsProcessed - Chart component configuration for component StatsLeadsProcessed
 * @property {Chart_ComponentConfig} StatsLeadConverted - Chart component configuration for component StatsLeadConverted
 */

/**
 * @typedef {Object} CockpitUnsatisfiedGarages - Chart page configuration for page CockpitUnsatisfiedGarages
 * @property {Chart_ComponentConfig} StatsUnsatisfiedUnprocessed - Chart component configuration for component StatsUnsatisfiedUnprocessed
 * @property {Chart_ComponentConfig} StatsUnsatisfiedProcessed - Chart component configuration for component StatsUnsatisfiedProcessed
 * @property {Chart_ComponentConfig} StatsUnsatisfiedSaved - Chart component configuration for component StatsUnsatisfiedSaved
 */

/**
 * @typedef {Object} CockpitUnsatisfiedTeam - Chart page configuration for page CockpitUnsatisfiedTeam
 * @property {Chart_ComponentConfig} StatsUnsatisfiedUnprocessed - Chart component configuration for component StatsUnsatisfiedUnprocessed
 * @property {Chart_ComponentConfig} StatsUnsatisfiedProcessed - Chart component configuration for component StatsUnsatisfiedProcessed
 * @property {Chart_ComponentConfig} StatsUnsatisfiedSaved - Chart component configuration for component StatsUnsatisfiedSaved
 */
/**
 * @typedef {Object} CockpitSatisfactionGarages - Chart page configuration for page CockpitSatisfactionGarages
 * @property {Chart_ComponentConfig} StatsNPS - Chart component configuration for component StatsNPS
 * @property {Chart_ComponentConfig} StatsPromotors - Chart component configuration for component StatsPromotors
 * @property {Chart_ComponentConfig} StatsDetractors - Chart component configuration for component StatsDetractors
 */
/**
 * @typedef {Object} CockpitSatisfactionTeam - Chart page configuration for page CockpitSatisfactionTeam
 * @property {Chart_ComponentConfig} StatsNPS - Chart component configuration for component StatsNPS
 * @property {Chart_ComponentConfig} StatsPromotors - Chart component configuration for component StatsPromotors
 * @property {Chart_ComponentConfig} StatsDetractors - Chart component configuration for component StatsDetractors
 */
/**
 * @typedef {Object} CockpitSatisfactionReviews - Chart page configuration for page CockpitSatisfactionReviews
 * @property {Chart_ComponentConfig} StatsNPS - Chart component configuration for component StatsNPS
 * @property {Chart_ComponentConfig} StatsPromotors - Chart component configuration for component StatsPromotors
 * @property {Chart_ComponentConfig} StatsDetractors - Chart component configuration for component StatsDetractors
 */
/**
 * @typedef {Object} CockpitContactsGarages - Chart page configuration for page CockpitContactsGarages
 * @property {Chart_ComponentConfig} StatsResponded - Chart component configuration for component StatsResponded
 * @property {Chart_ComponentConfig} StatsValidEmails - Chart component configuration for component StatsValidEmails
 * @property {Chart_ComponentConfig} StatsNotContactable - Chart component configuration for component StatsNotContactable
 */

/**
 * @typedef {Object} CockpitContactsTeam - Chart page configuration for page CockpitContactsTeam
 * @property {Chart_ComponentConfig} StatsResponded - Chart component configuration for component StatsResponded
 * @property {Chart_ComponentConfig} StatsValidEmails - Chart component configuration for component StatsValidEmails
 * @property {Chart_ComponentConfig} StatsNotContactable - Chart component configuration for component StatsNotContactable
 */
/**
 * @typedef {Object} CockpitContactsReviews - Chart page configuration for page CockpitContactsReviews
 * @property {Chart_ComponentConfig} StatsResponded - Chart component configuration for component StatsResponded
 * @property {Chart_ComponentConfig} StatsValidEmails - Chart component configuration for component StatsValidEmails
 * @property {Chart_ComponentConfig} StatsNotContactable - Chart component configuration for component StatsNotContactable
 */

/**
 * @typedef {Object} CockpitEReputationGarages - Chart page configuration for page CockpitEReputationGarages
 * @property {Chart_ComponentConfig} EreputationTileGaragescore - Chart component configuration for component EreputationTileGaragescore
 * @property {Chart_ComponentConfig} EreputationTileGoogle - Chart component configuration for component EreputationTileGoogle
 * @property {Chart_ComponentConfig} EreputationTileFacebook - Chart component configuration for component EreputationTileFacebook
 * @property {Chart_ComponentConfig} EreputationTilePagesJaunes - Chart component configuration for component EreputationTilePagesJaunes
 */

/**
 * @typedef {Object} CockpitEReputationReviews - Chart page configuration for page CockpitEReputationReviews
 * @property {Chart_ComponentConfig} EreputationTileGaragescore - Chart component configuration for component EreputationTileGaragescore
 * @property {Chart_ComponentConfig} EreputationTileGoogle - Chart component configuration for component EreputationTileGoogle
 * @property {Chart_ComponentConfig} EreputationTileFacebook - Chart component configuration for component EreputationTileFacebook
 * @property {Chart_ComponentConfig} EreputationTilePagesJaunes - Chart component configuration for component EreputationTilePagesJaunes
 */
/**
 * @typedef {Object} CockpitAutomationGarages - Chart page configuration for page CockpitAutomationGarages
 * @property {Chart_ComponentConfig} StatsAutomationSent - Chart component configuration for component StatsAutomationSent
 * @property {Chart_ComponentConfig} StatsAutomationOpened - Chart component configuration for component StatsAutomationOpened
 * @property {Chart_ComponentConfig} StatsAutomationConverted - Chart component configuration for component StatsAutomationConverted
 * @property {Chart_ComponentConfig} StatsAutomationLead - Chart component configuration for component StatsAutomationLead
 */

/**
 * @typedef {Object} CockpitAutomationCampaigns - Chart page configuration for page CockpitAutomationCampaigns
 * @property {Chart_ComponentConfig} StatsAutomationSent - Chart component configuration for component StatsAutomationSent
 * @property {Chart_ComponentConfig} StatsAutomationOpened - Chart component configuration for component StatsAutomationOpened
 * @property {Chart_ComponentConfig} StatsAutomationConverted - Chart component configuration for component StatsAutomationConverted
 * @property {Chart_ComponentConfig} StatsAutomationLead - Chart component configuration for component StatsAutomationLead
 */
