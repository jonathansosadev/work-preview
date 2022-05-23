// Rethink when publication and reservation information are complete and available

import React from "react";

const CarsDetailsPublicationTimePanel = (props) => {
  const { publicationInfo } = props;

  const available = () => {
    const since = new Date(publicationInfo.available_since).toDateString();
    const until = new Date(publicationInfo.available_until).toDateString();

    return { since, until };
  };

  //Complete accordingly when the time comes
  const timePercentage = () => {
    const since = new Date(publicationInfo.available_since);
    const until = new Date(publicationInfo.available_until);
    const today = new Date();

    const timeBetween = until.getTime() - since.getTime();
    const timeUntilNow = today.getTime() - since.getTime();

    const daysBetween = timeBetween / (1000 * 3600 * 24);
    const daysUntilNow = timeUntilNow / (1000 * 3600 * 24);

    return {
      total: daysBetween,
      progress: daysUntilNow,
      remaining: daysBetween - daysUntilNow,
    };
  };

  return (
    <div className="row justify-content-center m-2 m-md-3 p-2 p-md-3 position-relative _bg_tertiary _element_shadow">
      <div className="col-12 p-0 mb-2">
        <h5>Tiempo de publicación</h5>
      </div>

      <div className="col-6">
        <p className="m-0 text-left">{available().since}</p>
      </div>
      <div className="col-6">
        <p className="m-0 text-right">{available().until}</p>
      </div>
      <div className="col-12 progress m-2 p-0">
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{ width: `${timePercentage().progress}%` }}
          aria-valuenow={timePercentage().progress}
          aria-valuemin="0"
          aria-valuemax={timePercentage().total}
        ></div>
      </div>
      <div className="col-12">
        <p className="text-center m-0">
          Días restantes: {timePercentage().remaining.toFixed()}
        </p>
      </div>
    </div>
  );
};

export default CarsDetailsPublicationTimePanel;
