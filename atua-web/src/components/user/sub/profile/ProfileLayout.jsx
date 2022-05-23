import React from "react";

import CountryProvinceLogicutus from "../../../_shared/CountryProvinceLogicutus";
import IdTypesLogicutus from "../../../_shared/IdTypesLogicutus";
import ProfilePanelMain from "./ProfilePanel_Main";
import ProfilePanelAddress from "./ProfilePanel_Address";
import ProfilePanelDocument from "./ProfilePanel_Document";
import ProfilePanelLicense from "./ProfilePanel_License";
import ProfilePanelEmail from "./ProfilePanel_Email";
import ProfilePanelPassword from "./ProfilePanel_Password";
import ProfilePanelControls from "./ProfilePanel_Controls";
import ProfilePanelContainer from "./ProfilePanel_Container";

const ProfileLayout = (props) => {
  const { user, handlers, completeImages, formData } = props;

  const {
    document_picture_front,
    document_picture_back,
    driver_license_front,
    driver_license_back,
  } = formData;

  return (
    <div className="row justify-content-center align-items-start p-1 p-md-5 _bg_topographic">
      <div className="col-12 col-md-3 mt-4 mt-md-0">
        <div className="row justify-content-center">
          {/* <!-- MAIN INFO PANEL --> */}
          <ProfilePanelContainer>
            <ProfilePanelMain user={user} handlers={handlers} />
          </ProfilePanelContainer>

          {/* <!-- EMAIL PANEL --> */}
          <ProfilePanelEmail user={user} handlers={handlers} />

          {/* <!-- PASSWORD PANEL --> */}
          <ProfilePanelContainer>
            <ProfilePanelPassword user={user} handlers={handlers} />
          </ProfilePanelContainer>
        </div>
      </div>

      <div className="col-12 col-md-3 mt-4 mt-md-0">
        <div className="row justify-content-center">
          {/* <!-- ADDRESS PANEL --> */}
          <ProfilePanelContainer>
            <CountryProvinceLogicutus>
              <ProfilePanelAddress user={user} handlers={handlers} />
            </CountryProvinceLogicutus>
          </ProfilePanelContainer>

          {/* <!-- ID PANEL --> */}
          <ProfilePanelContainer>
            <IdTypesLogicutus>
              <ProfilePanelDocument
                user={user}
                handlers={handlers}
                completeImages={completeImages}
                images={{ document_picture_front, document_picture_back }}
              />
            </IdTypesLogicutus>
          </ProfilePanelContainer>

          {/* <!-- DRIVER LICENSE PANEL --> */}
          <ProfilePanelContainer>
            <ProfilePanelLicense
              user={user}
              handlers={handlers}
              completeImages={completeImages}
              images={{
                license_front_image: driver_license_front,
                license_back_image: driver_license_back,
              }}
            />
          </ProfilePanelContainer>
        </div>
      </div>

      <div className="col-12 col-md-3 align-self-center mt-4 mt-md-0">
        <ProfilePanelControls />
      </div>
    </div>
  );
};

export default ProfileLayout;
