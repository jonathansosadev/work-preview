//SuperUltraThing that modularizes the country and provinces list fetching

import React, { useState, useEffect, cloneElement } from "react";

import { useTranslation } from "react-i18next";

import { headers } from "../../assets/scripts/requests/universalHeader";

import {
  apiURI,
  getCountriesEP,
  getProvincesEP,
  getCitiesEP,
} from "../../assets/scripts/requests/dbUri";

const CountryProvinceLogicutus = (props) => {
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  const [t] = useTranslation("shared");

  const getCountries = async () => {
    try {
      let countries = await fetch(apiURI + getCountriesEP, {
        method: "GET",
        headers,
        redirect: "follow",
      });

      if (countries.ok) {
        let countriesList = await countries.json();

        setCountries(countriesList.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCities = async () => {
    try {
      let cities = await fetch(apiURI + getCitiesEP, {
        method: "GET",
        headers,
        redirect: "follow",
      });

      if (cities.ok) {
        let citiesList = await cities.json();

        setCities(citiesList.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // On mount, requests country list from server, sets it in state
  useEffect(() => {
    getCountries();

    getCities();
  }, []);

  // Country options list generation
  const countriesOptions = () => {
    return [
      <option key="country" value="">
        {t("logicutus.country")}
      </option>,
      ...countries.map((country) => (
        <option key={country.id} value={country.id}>
          {country.name}
        </option>
      )),
    ];
  };

  // On country change, requests cities from that country. Sets it in state
  const handleCountryChange = async (evt) => {
    let { value } = evt.target;

    if (value === "" || value === null) return;

    try {
      let provinces = await fetch(
        apiURI + getProvincesEP + `?country=${value}`,
        {
          method: "GET",
          headers,
          redirect: "follow",
        }
      );

      if (provinces.ok) {
        let provincesList = await provinces.json();

        setProvinces(provincesList.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Province options list generation
  const provincesOptions = () => {
    return [
      <option key="province" value="">
        {t("logicutus.province")}
      </option>,
      ...provinces.map((province) => (
        <option key={province.id} value={province.id}>
          {province.name}
        </option>
      )),
    ];
  };

  const handleProvinceChange = async (evt) => {
    let { value } = evt.target;

    if (value === "") {
      setCities([]);

      return;
    }

    try {
      let cities = await fetch(apiURI + getCitiesEP + `?province=${value}`, {
        method: "GET",
        headers,
        redirect: "follow",
      });

      if (cities.ok) {
        let citiesList = await cities.json();

        setCities(citiesList.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const citiesOptions = () => {
    return [
      <option key="city" value="">
        City
      </option>,
      ...cities.map((city) => (
        <option key={city.id} value={city.id}>
          {city.name}
        </option>
      )),
    ];
  };

  const translateAddress = async (provinceID) => {
    const provinceObj = await fetch(`${apiURI}${getProvincesEP}${provinceID}/`);

    if (provinceObj.ok) {
      const data = await provinceObj.json();

      return {
        province: data.name,
        country: data.country,
      };
    }
  };

  const selectOptions = {
    countriesOptions,
    provincesOptions,
    citiesOptions,
  };

  return (
    <>
      {cloneElement(props.children, {
        ...props,
        handleCountryChange,
        handleProvinceChange,
        selectOptions,
        translateAddress,
      })}
    </>
  );
};

export default CountryProvinceLogicutus;
