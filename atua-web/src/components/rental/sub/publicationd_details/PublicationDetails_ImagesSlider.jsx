import { React, useState } from "react";

const ImagesSlider = (props) => {
  const { images, publicationInfo } = props;

  const [displayedImage, setDisplayedImage] = useState(0);

  const availableImages = () =>
    images.map((image, index) => (
      <div className="col" key={index}>
        <figure onClick={() => selectImage(index)}>
          <img
            className="img img-fluid"
            src={image}
            alt={`car view ${index + 1}`}
          />
        </figure>
      </div>
    ));

  const selectImage = (imageNumber) => {
    setDisplayedImage(imageNumber);
  };

  return (
    <div className="col-6 p-4 align-items-center text-center">
      <h1 className="mb-2">{`${
        publicationInfo.car ? publicationInfo.car.brand : ""
      } ${publicationInfo.car ? publicationInfo.car.model : ""}`}</h1>
      <div className="row justify-content-center mt-3">
        <div className="col-12 p-0">
          <figure>
            <img
              src={images[displayedImage]}
              alt={`selected car view ${displayedImage}`}
              className="img img-fluid"
            />
          </figure>
        </div>
      </div>
      <div className="row justify-content-around mt-3">{availableImages()}</div>
    </div>
  );
};

export default ImagesSlider;
