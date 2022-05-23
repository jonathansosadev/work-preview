const { ObjectId } = require('mongodb');

module.exports = {
  _id: ObjectId("605c3f3117f6290003f1ac3d"),
  garageId: "58790540a4121b1a00bd0e87",
  type: "NewVehicleSale",
  garageType: "Dealership",
  shouldSurfaceInStatistics: true,
  service: {
      isQuote: null,
      providedAt: new Date("2021-03-23T23:00:00.000Z"),
      frontDeskUserName: "Kévin Briand",
      frontDeskGarageId: "COGNAC M",
      frontDeskCustomerId: "287534",
      middleMans: [ 
          "proximity"
      ]
  },
  customer: {
      isRevised: true,
      isValidated: true,
      contact: {
          email: {
              value: "seb.chonchon@gmail.com",
              original: "seb.chonchon@gmail.com",
              isSyntaxOK: true,
              isEmpty: false,
              isValidated: true
          },
          mobilePhone: {
              value: "+33687532459",
              original: "+33641389906",
              originalContactStatus: "Valid",
              originalContactStatusExplain: "",
              revised: "+33687532459",
              isSyntaxOK: true,
              isEmpty: false,
              isUnsubscribed: false,
              isDropped: false,
              isComplained: false,
              revisedAt: new Date("2021-04-05T18:00:34.821Z"),
              isOriginalSyntaxOK: true,
              isOriginalEmpty: true
          }
      },
      gender: {
          isEmpty: true
      },
      title: {
          value: "Monsieur",
          revised: "Monsieur",
          isSyntaxOK: true,
          isEmpty: false,
          revisedAt: new Date("2021-04-05T18:00:34.364Z")
      },
      firstName: {
          value: "Perrochon",
          original: "Sebastien Et Nelly",
          revised: "Perrochon",
          isSyntaxOK: true,
          isEmpty: false,
          isOriginalEmpty: true,
          revisedAt: new Date("2021-04-05T18:00:34.427Z"),
          isOriginalSyntaxOK: true
      },
      lastName: {
          value: "Perrochon Et Pere",
          original: "Perrochon Et Pere",
          isSyntaxOK: true,
          isEmpty: false
      },
      fullName: {
          value: "Perrochon ",
          original: "Sebastien Et Nelly Perrochon Et Pere",
          revised: "Perrochon ",
          isSyntaxOK: true,
          isEmpty: false,
          isOriginalEmpty: true,
          revisedAt: new Date("2021-04-05T18:00:34.391Z"),
          isOriginalSyntaxOK: true
      },
      street: {
          value: "19 Rue Du Port Du Lys",
          original: "19 Rue Du Port Du Lys",
          isSyntaxOK: true,
          isEmpty: false,
          isValidated: true
      },
      postalCode: {
          value: "16100",
          original: "16100",
          isSyntaxOK: true,
          isEmpty: false,
          isValidated: true
      },
      city: {
          value: "Saint Laurent De Cognac",
          original: "Saint Laurent De Cognac",
          isSyntaxOK: true,
          isEmpty: false,
          isValidated: true
      },
      countryCode: {
          value: "FR",
          original: "FR",
          isSyntaxOK: true,
          isEmpty: false
      },
      rgpd: {
          optOutMailing: {
              isEmpty: true
          },
          optOutSMS: {
              isEmpty: true
          }
      }
  },
  vehicle: {
      isRevised: false,
      isValidated: false,
      make: {
          value: "Opel",
          original: "Opel",
          isSyntaxOK: true,
          isEmpty: false
      },
      model: {
          value: "Nouvelle CORSA",
          original: "Nouvelle CORSA",
          isSyntaxOK: true,
          isEmpty: false
      },
      mileage: {
          isEmpty: true
      },
      plate: {
          value: "FR199BC",
          original: "FR199BC",
          isSyntaxOK: true,
          isEmpty: false
      },
      vin: {
          value: "VXKUPHNKKL4196562",
          original: "VXKUPHNKKL4196562",
          isSyntaxOK: true,
          isEmpty: false
      },
      countryCode: {
          original: "FR",
          isSyntaxOK: false,
          isEmpty: false
      },
      registrationDate: {
          isEmpty: true
      }
  },
  campaign: {
      campaignId: ObjectId("605c3f3117f6290003f1ac40"),
      status: "Running",
      importedAt: new Date("2021-03-25T07:43:45.635Z"),
      contactStatus: {
          hasBeenContactedByPhone: false,
          hasBeenContactedByEmail: true,
          hasOriginalBeenContactedByPhone: false,
          hasOriginalBeenContactedByEmail: false,
          status: "Received",
          "phoneStatus": "Valid",
          "emailStatus": "Valid",
          previouslyContactedByPhone: false,
          previouslyContactedByEmail: false,
          previouslyDroppedEmail: false,
          previouslyDroppedPhone: false,
          previouslyUnsubscribedByEmail: false,
          previouslyUnsubscribedByPhone: false,
          previouslyComplainedByEmail: false
      },
      contactScenario: {
          firstContactedAt: new Date("2021-04-01T09:44:02.826Z"),
          nextCampaignReContactDay: null,
          nextCampaignContact: null,
          nextCampaignContactDay: null,
          lastCampaignContactSent: "maintenance_email_thanks_1",
          lastCampaignContactSentAt: new Date("2021-04-29T08:41:37.996Z"),
          nextCheckSurveyUpdatesDecaminute: null,
          firstContactByEmailDay: 18718,
          firstContactByPhoneDay: 18720,
          nextCampaignContactEvent: "CONTACT_SENT",
          nextCampaignContactAt: new Date("1970-01-01T00:00:00.000Z")
      }
  },
  source: {
      sourceId: ObjectId("605c3f3117f6290003f1ac3a"),
      importedAt: new Date("2021-03-25T07:43:45.494Z"),
      raw: {
          index: 2,
          cells: {
              providedCustomerId: "287534",
              gender: "Monsieur et Madame",
              firstName: "SEBASTIEN ET NELLY",
              lastName: "PERROCHON  ET PERE",
              postCode: "16100",
              city: "SAINT LAURENT DE COGNAC",
              rue: "19 RUE DU PORT DU LYS",
              "": "",
              homePhone: "0687532459",
              officePhone: "",
              mobilePhone: "0641389906",
              email: "seb.chonchon@gmail.com",
              vehicleRegistrationPlate: "FR199BC",
              vehicleMake: "OPEL",
              vehicleModel: "Nouvelle CORSA",
              rowType: "VN",
              dataRecordCompletedAt: "2021-03-24 00:00:00.000",
              VIN: "VXKUPHNKKL4196562",
              Société: "MORGAN'S",
              providedGarageId: "COGNAC M",
              providedFrontDeskUserName: "Kévin Briand",
              salecode: "U",
              Intermediaire: ""
          }
      },
      type: "DataFile"
  },
  createdAt: new Date("2021-03-25T07:43:45.542Z"),
  updatedAt: new Date("2021-04-29T08:41:38.033Z"),
  survey: {
      acceptNewResponses: true,
      lastRespondedAt: new Date("2021-04-05T18:00:34.330Z"),
      firstRespondedAt: new Date("2021-04-05T17:59:30.706Z"),
      foreignResponses: [ 
          {
              source: "Internal survey",
              date: new Date("2021-04-05T17:59:30.703Z"),
              payload: {
                  rating: "10",
                  isComplete: false,
                  pageNumber: 1,
                  pageCount: 4,
                  timestamp: 1617645568327.0,
                  acceptTermOfUse: true,
                  dataType: "NewVehicleSale",
                  comment: "Très bien accueilli, et très bon conseil, très satisfait rien à redire "
              }
          }, 
          {
              source: "Internal survey",
              date: new Date("2021-04-05T18:00:34.327Z"),
              payload: {
                  rating: "10",
                  isComplete: false,
                  pageNumber: 2,
                  pageCount: 4,
                  timestamp: 1617645632588.0,
                  acceptTermOfUse: true,
                  dataType: "NewVehicleSale",
                  comment: "Très bien accueilli, et très bon conseil, très satisfait rien à redire ",
                  serviceMiddleMans: [ 
                      "proximity"
                  ],
                  title: "Monsieur",
                  fullName: "Perrochon ",
                  email: "seb.chonchon@gmail.com",
                  mobilePhone: "0687532459",
                  streetAddress: "19 rue du port du lys",
                  postalCode: "16100",
                  city: "Saint Laurent de cognac "
              }
          }
      ],
      progress: {
          isComplete: false,
          pageNumber: 2,
          pageCount: 4
      },
      urls: {
          base: "https://survey.garagescore.com/s/7954eb241a6b0ea57ade98b7e",
          baseShort: "http://gsco.re/codBdRSt1",
          mobileLanding: "https://survey.garagescore.com/m/7954eb241a6b0ea57ade98b7e",
          unsatisfiedLanding: "https://survey.garagescore.com/u/7954eb241a6b0ea57ade98b7e"
      },
      lastRespondentIP: "2a01:cb18:27e:0:b178:f8b:9d95:6d27",
      lastRespondentFingerPrint: "e94bdaf02af6f8ef9e5f2a7b6ffbdb4c",
      type: "NewVehicleSale",
      sendAt: new Date("2021-04-01T09:44:02.782Z"),
      isIntern: true
  },
  alert: {
      checkAlertHour: 449347
  },
  review: {
      createdAt: new Date("2021-04-05T17:59:30.716Z"),
      rating: {
          value: 10
      },
      comment: {
          text: "Très bien accueilli, et très bon conseil, très satisfait rien à redire ",
          status: "Approved",
          updatedAt: new Date("2021-04-05T17:59:30.720Z"),
          approvedAt: new Date("2021-04-05T17:59:30.725Z"),
          rejectedReason: null
      }
  }
};
