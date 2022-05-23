import { ChartConfigPages, ChartConfigViews, ChartConfigFormats } from '../enumV2';

const ChartConfigValidator = {
  isValid: (CHART_CONFIGURATION) => {
    /* Chart configuration validator */
    for (const [page, pageConfig] of Object.entries(CHART_CONFIGURATION.components)) {
      /* check that every page exists in the enum */
      if (!ChartConfigPages.hasValue(page)) {
        console.error('\x1b[31m', `ERROR [Chart configuration] : Enum doesn't have a page named ${page}`, '\x1b[0m');
        return false;
      }

      const expectedComponents = ChartConfigPages.getPropertyFromValue(page, 'components');

      /* check that every components are associated with the page in the enum */
      if (Object.keys(pageConfig).length !== expectedComponents.length) {
        console.error(`ERROR [Chart configuration] : invalid components configuration for page "${page}"`);
        return false;
      }

      for (const component in pageConfig) {
        if (!expectedComponents.includes(component)) {
          console.error(`ERROR [Chart configuration] : page "${page}" doesn't have a component named "${component}"`);
          return false;
        }

        if (typeof pageConfig[component].loading !== 'boolean') {
          console.error(
            `ERROR [Chart configuration] : missing  or invalid required property "loading" for page "${page}" in component "${component}"`
          );
          return false;
        }

        if (!ChartConfigViews.hasValue(pageConfig[component].view)) {
          console.error(
            `ERROR [Chart configuration] : missing or invalid required property "view "for page "${page}" in component "${component}"`
          );
          return false;
        }

        if (pageConfig[component].format && !ChartConfigFormats.hasValue(pageConfig[component].format)) {
          console.error(
            `ERROR [Chart configuration] : invalid property "format" for page "${page}" in component "${component}"`
          );
          return false;
        }

        if (typeof pageConfig[component].field !== 'string' || !pageConfig[component].field) {
          console.error(
            `ERROR [Chart configuration] : missing or invalid required property "field" for page "${page}" in component "${component}"`
          );
          return false;
        }

        if (
          !pageConfig[component].target ||
          !pageConfig[component].target.label ||
          !pageConfig[component].target.dataSet
        ) {
          console.error(
            `ERROR [Chart configuration] : missing or invalid required property "target" for page "${page}" in component "${component}"`,
          );
          return false;
        }
      }
    }
    /* no errors detected */
    return true;
  },
};

export default ChartConfigValidator;
