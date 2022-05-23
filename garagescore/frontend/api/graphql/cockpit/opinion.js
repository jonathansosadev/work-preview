export default {
  // sentiment report for one garage
  report() {
    return {
      // if no report available, ask user to wating
      loading: Boolean,
      // the stringified report
      report: String
    }
  }
}