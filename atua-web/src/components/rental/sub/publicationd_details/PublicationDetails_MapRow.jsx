import { React, useState, useEffect } from "react";

const MapRow = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const location = () => {
      const coordinates = (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      };

      const error = (error) => console.log(error);

      return navigator.geolocation.getCurrentPosition(coordinates, error);
    };

    location();
  }, []);

  return (
    latitude &&
    longitude && (
      <div className="col-10 p-3">
        <div className="row px-3 justify-content-center">
          <iframe
            title="current location"
            width="100%"
            height="300px"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              longitude + 0.01
            }%2C${latitude + 0.01}%2C${longitude - 0.01}%2C${
              latitude - 0.01
            }&amp;layer=mapnik`}
            style={{ border: "1px solid black" }}
          ></iframe>
        </div>
        <div className="row px-3">
          <small>
            <a
              href={`https://www.openstreetmap.org/#map=17/${latitude}/${longitude}`}
            >
              View Larger Map
            </a>
          </small>
        </div>
      </div>
    )
  );
};

export default MapRow;
