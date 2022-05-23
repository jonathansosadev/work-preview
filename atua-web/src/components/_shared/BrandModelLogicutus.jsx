//SuperUltraThing that modularizes the model, brand and prices list fetching

import React, { useState, useEffect, cloneElement } from "react";

import { useTranslation } from "react-i18next";

import {
  apiURI,
  getBrandsEP,
  getModelsEP,
  // getModelPricesEP,
} from "../../assets/scripts/requests/dbUri";

import { headers } from "../../assets/scripts/requests/universalHeader";

const BrandModelLogicutus = (props) => {
  const [brandsList, setBrandsList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [pricesList, setPricesList] = useState([]);

  const [t] = useTranslation("shared");

  useEffect(() => {
    // Car brand list request
    if (brandsList.length === 0) {
      getAndStoreBrands();
    }

    setPricesList([]);
  }, [brandsList.length]);

  const getAndStoreBrands = async () => {
    try {
      const brandsResponse = await fetch(`${apiURI}${getBrandsEP}`, {
        headers,
      });

      if (brandsResponse.ok) {
        const brands = await brandsResponse.json();

        const brandsFiltered = brands.data.filter(
          (brand) =>
            brand.price_from && brand.price_to && brand.price_to >= 2012
        );

        await setBrandsList(brandsFiltered);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Brand options list
  const brandsOptions = () => {
    if (brandsList.length !== 0) {
      return [
        <option key="brand" value="null">
          {t("logicutus.brand")}
        </option>,
        ...brandsList.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        )),
      ];
    } else {
      return (
        <option value="null" disabled>
          {t("logicutus.loading")}
        </option>
      );
    }
  };

  // On brand change, requests model
  const handleBrandChange = async (evt) => {
    const { value } = evt.target;

    if (value === "" || value === null) return;

    try {
      const modelsResponse = await fetch(
        `${apiURI}${getModelsEP}?brand_id=${value}`,
        { headers }
      );

      if (modelsResponse.ok) {
        const models = await modelsResponse.json();

        const modelsFiltered = models.data.filter(
          (model) =>
            model.price_from && model.price_to && model.price_to >= 2012
        );

        await setModelsList(modelsFiltered);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Models options list
  const modelsOptions = () => {
    if (modelsList.length !== 0) {
      return [
        <option key="model" value="null">
          {t("logicutus.model")}
        </option>,
        ...modelsList.map((model) => (
          <option key={model.id} value={model.id}>
            {model.description}
          </option>
        )),
      ];
    } else {
      return (
        <option value="null" disabled>
          {t("logicutus.no_results")}
        </option>
      );
    }
  };

  const handleModelChange = async (evt) => {
    let { value } = evt.target;

    if (value === "" || value === null) {
      await setPricesList([]);
      return;
    }

    const model = modelsList.find((model) => model.id === parseInt(value));

    if (!model.price_from || !model.price_to) return;

    let years = [];

    for (let year = model.price_from; year <= model.price_to; year++) {
      years.push(year);
    }

    await setPricesList(years);

    // Currently not entirely implemented
    //requests prices
    //   try {
    //     let prices = await fetch(apiURI + getModelPricesEP + `${value}/`);

    //     if (prices.ok) {
    //       let pricesList = (await prices.json()).prices;

    //       let priceList = pricesList
    //         .filter((price) => price.price > 0 && price.year > 2012)
    //         .sort((a, b) => a.year - b.year);

    //       setPricesList(priceList);
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
  };

  const yearOptions = () => {
    if (pricesList.length > 0) {
      return [
        <option key="year" value="null" disabled>
          {t("logicutus.year")}
        </option>,
        ...pricesList.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        )),
      ];
    } else return [];
  };

  const handleSelect = {
    handleBrandChange,
    handleModelChange,
  };

  const selectOptions = {
    brandsOptions,
    modelsOptions,
    yearOptions,
  };

  // const prices = pricesList;

  return (
    <>
      {cloneElement(props.children, {
        ...props,
        handleSelect,
        selectOptions,
      })}
    </>
  );
};

export default BrandModelLogicutus;
