db.getCollection('campaignScenarios')
  .find({})
  .forEach((c) => {
    if (!c.followupAndEscalate.Automation) {
      c.followupAndEscalate.Automation = {
        lead: {
          followup: {
            enabled: true,
            delay: 90,
          },
          escalate: {
            enabled: true,
            stage_1: 27,
            stage_2: 36,
          },
        },
      };
      db.getCollection('campaignScenarios').save(c);
    }
  });
