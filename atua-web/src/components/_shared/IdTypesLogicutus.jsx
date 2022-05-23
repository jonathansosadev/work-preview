import React, { useEffect, useState, cloneElement } from "react";

import { apiURI, documentTypesEP } from "../../assets/scripts/requests/dbUri";
import { headers } from "../../assets/scripts/requests/universalHeader";

const IdTypesLogicutus = (props) => {
  const [idTypes, setIdTypes] = useState([
    {
      id: 0,
      initials: "ID",
      name: "ID",
    },
  ]);

  useEffect(() => {
    const getDocTypes = async () => {
      try {
        let docTypes = await fetch(apiURI + documentTypesEP, {
          method: "GET",
          headers,
          redirect: "follow",
        });

        if (docTypes.ok) {
          let docs = await docTypes.json();

          setIdTypes([...idTypes, ...docs.data.results]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getDocTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Country options list generation
  const idOptions = () =>
    idTypes.map((idType) => (
      <option key={idType.id} value={idType.id}>
        {idType.initials}
      </option>
    ));

  return (
    <>
      {cloneElement(props.children, {
        ...props,
        idTypes,
        idOptions,
      })}
    </>
  );
};

export default IdTypesLogicutus;
