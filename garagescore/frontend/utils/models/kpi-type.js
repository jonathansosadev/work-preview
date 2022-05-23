import Enum from '~/utils/enum.js'

/** For the attention of whoever will add a type in here
 *  Please keep the following logic:
 *    - 1x if we're talking about garages
 *    - 2x if we're talking about users
 *    - 3x if we're talking about AutomationCampaigns
 *    - and start a new tens range if it's about something else
 *    - and don't forget to add it in the list here
 *    - and add it in the frontend frontend/utils/models/kpi.type.js
 */
export default new Enum({
  GARAGE_KPI: 10, // KPIs for a given garage
  AGENT_GARAGE_KPI: 11, // KPIs for an agent, in relation with its R1. Used with lead tickets figures
  SOURCE_KPI: 12, // KPIs for a source of a garage

  USER_KPI: 20, // KPIs for a user of a garage. Taking the user._id here. Used with unsatisfied & lead tickets figures
  FRONT_DESK_USER_KPI: 21, // KPIs for a user of a garage. Taking the service.frontDeskUserName here. Used with conversion figures

  AUTOMATION_CAMPAIGN_KPI: 30 // KPIs for an Automation Campaign of a Garage. Taking automationCampaign._id here. Used in cockpit/automation/campaigns
});


