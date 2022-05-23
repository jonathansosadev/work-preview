export default function () {
    return {
      userEmail: String,
      myKpis: {
        name: String,
        values: { k: String, v: String }
      },
      report: {
        name: String,
        values: String
      }
    };
}
