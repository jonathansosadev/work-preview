export default {
  CusteedbookSampleProps: [
        {
          label: 'sampleSelect',
          value: "Bobby",
          inputType: 'select',
          inputOptions: [
            "Johnny",
            "Bobby"
          ]
        },
        {
          label: 'sampleJson',
          value: {
            chicken: 'Teehee'
          },
          inputType: 'json',
        },
        {
          label: 'sampleArray',
          value: ["Joe", "Bob", "Oscar"],
          inputType: 'json',
        },
        {
          label: 'sampleText',
          value: "C'est pas l'homme qui prend la mer, c'est la mer qui prend l'homme",
          inputType: 'text',
        },
        {
          label: 'sampleBoolean',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'sampleNumber',
          value: 12,
          inputType: 'number',
        },
        {
          label: 'sampleCallback',
          value: (iteration, str) => {
            alert(`Le callback a été appellé ${iteration} fois, la string en second argument est "${str}"`);
          }
        },
        {
          label: 'default',
          value: `<p class="red">Ceci est un p avec la classe red (slot principal)</p>`,
          inputType: 'text',
          isSlot: true
        },
        {
          label: 'named',
          value: `<p class="red">Ceci est un p avec la classe red</p>`,
          inputType: 'text',
          isSlot: true
        },
      ],
      KpiDigestProps: [
        { label: 'done', value: 3, inputType: 'number' },
        { label: 'doneText', value: "Wegood", inputType: 'text' },
        { label: 'total', value: 3, inputType: 'number' },
        { label: 'doneApv', value: 3, inputType: 'number' },
        { label: 'doneVn', value: 3, inputType: 'number' },
        { label: 'doneVo', value: 3, inputType: 'number' }
      ],
      KPISkeletonProps: [
        {
          label: 'noBottom',
          value: true,
          inputType: 'checkbox',
        },
        {
          label: 'noMainValue',
          value: true,
          inputType: 'select',
          inputOptions: [
            false,
            true
          ]
        },
        {
          label: 'haveSubtitle',
          value: true,
          inputType: 'select',
          inputOptions: [
            false,
            true
          ]
        },
      ],
      AppTextProps: [
        {
          label: 'noBottom',
          default: true,
          inputType: 'select',
          inputOptions: [
            'false',
            'true'
          ]
        },
        {
          label: 'noInfo',
          default: true,
          input: {
            inputType: 'boolean',
          }
        },
        {
          label: 'haveSubtitle',
          default: false,
          input: {
            inputType: 'text',
          }
        },
        {
          label: 'testNumber',
          default: 12,
          input: {
            inputType: 'number',
          }
        },
      ],
      ButtonProps: [
        {
          label: 'size',
          value: `default`,
          inputType: 'select',
          inputOptions: [
            "xs",
            "sm",
            "default",
            "md",
            "lg",
            "xl"
          ]
        },
        {
          label: 'type',
          value: "orange",
          inputType: 'select',
          inputOptions: [
            "primary",
            "danger",
            "warning",
            "success",
            "orange",
            "default"
          ]
        },
        {
          label: 'loading',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'link',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'border',
          value: 'round',
          inputType: 'select',
          inputOptions: [
            "round",
            "square"
          ]
        },
        {
          label: 'disabled',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'fullSized',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'fullSizedNoPadding',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'active',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'left',
          value: `Button`,
          inputType: 'text',
          isSlot: true
        },
      ],
      DropdownAutomationCampaignsProps: [
        {
          label: 'availableTargets',
          value: [{ id: '1', name: "RDV annuel atelier des clients Apv" }, { id: '2', name: "RDV annuel atelier des clients Vn" }],
          inputType: 'json',
        },
        {
          label: 'disabled',
          value: false,
          inputType: 'checkbox',
        },
      ],
      StatusDiodeProps: [
        {
          label: 'status',
          value: 'Actif',
          inputType: 'select',
          inputOptions: [
            "Actif",
            "Inactif",
            "Bloqué"
          ]
        },
        {
          label: 'diode',
          value: 'success',
          inputType: 'select',
          inputOptions: [
            "success",
            "muted"
          ]
        },
        {
          label: 'tooltip',
          value: 'Lancée le XXX',
          inputType: 'select',
          inputOptions: [
            "Lancée le XXX",
            "Bloquée, manque de données",
            "Inactive"
          ]
        },
      ],
      SearchbarProps: [
        {
          label: 'placeholderString',
          value: `Rechercher une Campagne ex : Relance Apv clients Vn`,
          inputType: 'text'
        }
      ],
      SeachbarActiveFilterProps: [
        {
          label: 'icon',
          value: 'icon-gs-mobile',
          inputType: 'text',
        },
        {
          label: 'label',
          value: `Email & SMS`,
          inputType: 'text'
        },
      ],
      SearchbarAccordionProps: [
        {
          label: 'isOpen',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'label',
          value: `tesssst`,
          inputType: 'text'
        },
        {
          label: 'icon',
          value: 'icon-gs-mobile',
          inputType: 'text',
        },
        {
          label: 'items',
          value: [{ value: 'on', label: "Activer" }, { value: 'off', label: "Désactiver" }],
          inputType: 'json',
        },
      ],
      SearchbarAccordionItemProps: [
        {
          label: 'label',
          value: 'Email & SMS',
          inputType: 'text',
        },
        {
          label: 'active',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'value',
          value: 'Hello world',
          inputType: 'text',
        },
      ],
      SearchbarFilterProps: [
        {
          label: 'options',
          value: [
            {
              key: "surveySatisfactionLevel",
              label: "score",
              icon: "icon-gs-gauge-dashboard",
              values: [
                { label: "Promoteur", value: "Promoteur" },
                { label: "Passif", value: "Passif" },
                { label: "Détracteur", value: "Détracteur" }
              ]
            },
          ],
          inputType: 'json',
        },
        {
          label: 'value',
          value: 'Hello world',
          inputType: 'text',
        },
        {
          label: 'filters',
          value: {
            name: 'success'
          },
          inputType: 'json',
        },
        {
          label: 'placeholderString',
          value: 'dsdsdsdsds',
          inputType: 'text',
        },
      ],
      MobileModalFiltersProps: [
        {
          label: 'options',
          value: [
            {
              key: "surveySatisfactionLevel",
              label: "score",
              icon: "icon-gs-gauge-dashboard",
              values: [
                { label: "Promoteur", value: "Promoteur" },
                { label: "Passif", value: "Passif" },
                { label: "Détracteur", value: "Détracteur" }
              ]
            },
          ],
          inputType: 'json',
        },
        {
          label: 'value',
          value: {
            name: 'success'
          },
          inputType: 'json',
        },
        {
          label: 'filters',
          value: {
            name: 'success'
          },
          inputType: 'json',
        }
      ],
      MobileSelectFiltersProps: [
        {
          label: 'options',
          value: [
          {
            key: "surveySatisfactionLevel",
            label: "score",
            icon: "icon-gs-gauge-dashboard",
            values: [
                { label: "Promoteur", value: "Promoteur" },
                { label: "Passif", value: "Passif" },
                { label: "Détracteur", value: "Détracteur" }
              ]
            },
          ],
          inputType: 'json',
        },
        {
          label: 'value',
          value: {
            name: 'success'
          },
          inputType: 'json',
        },
        {
          label: 'filters',
          value: {
            name: 'success'
          },
          inputType: 'json',
        }
      ],
      MobileSelectFiltersItemProps: [
        {
          label: 'items',
          value: [{ value: 'on', label: "Activer" }, { value: 'off', label: "Désactiver" }],
          inputType: 'json',
        },
        {
          label: 'valueActive',
          value: 'dddddddd',
          inputType: 'text',
        }
      ],
      InputBasicProps: [
        {
          label: 'value',
          value: '',
          inputType: 'text',
        },
        {
          label: 'size',
          value: '100',
          inputType: 'text',
        },
        {
          label: 'validateEvent',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'sendButton',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'debounce',
          value: 12,
          inputType: 'number',
        },
        {
          label: 'error',
          value: false,
          inputType: 'checkbox',
        },
        {
          label: 'autofocus',
          value: true,
          inputType: 'checkbox',
        },
      ],
      DropdownSelectorProps: [
        {
          label: 'icon',
          value: 'icon-gs-setting-toggle',
          inputType: 'text',
        },
        {
          label: 'title',
          value: 'Statut',
          inputType: 'text',
        },
        {
          label: 'subtitle',
          value: 'Définir à',
          inputType: 'text',
        },
        {
          label: 'items',
          value: [{ value: 'on', label: "Activer" }, { value: 'off', label: "Désactiver" }],
          inputType: 'json',
        },
        {
          label: 'disabled',
          value: false,
          inputType: 'checkbox',
        },
      ],
      TagProps: [
        {
          label: 'content',
          value: `Email`,
          inputType: 'text'
        },
        {
          label: 'bgColor',
          value: `#BCBCBC`,
          inputType: 'text',
        },
        {
          label: 'color',
          value: `#FFFFFF`,
          inputType: 'text',
        }
      ],
      CodeProps: [
        {
          label: 'code',
          value: `<i class="icon-gs-computer"></i>`,
          inputType: 'text'
        }
      ],
      CircularGraphProps: [
        {
          label: 'bgColor',
          value: `#BCBCBC`,
          inputType: 'text'
        },
        {
          label: 'title',
          value: `Taux d'ouverture`,
          inputType: 'text'
        },
        {
          label: 'sets',
          value: [{ label: 'Desktop', value: 88, color: '#219ab5' }, { label: 'Mobile', value: 12, color: '#757575' }],
          inputType: 'json',
        }
      ],
      MobileMessagePreviewProps: [
        {
          label: 'max',
          value: 150,
          inputType: 'number'
        },
        {
          label: 'text',
          value: `Tapez votre texte ici`,
          inputType: 'text'
        },
        {
          label: 'url',
          value: `bit.ly/10GSR2`,
          inputType: 'text'
        },
        {
          label: 'preview',
          value: true,
          inputType: 'checkbox',
        },
      ],
      ElearningDashboardProps: [
        {
          label: 'resourcesByProduct',
          value: [{ product: 'XLeads' }],
          inputType: 'json',
        },
      ],
      ChartProps: [
      ],
      SetupStepProps: [
        {
          label: 'stepName',
          value: "Name",
          inputType: 'text',
        },
        {
          label: 'label',
          value: "Nom",
          inputType: 'text',
        },
        {
          label: 'subLabel',
          value: "Ajoutez un nom de contenu personnalisé",
          inputType: 'text',
        },
        {
          label: 'isOpen',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'isModification',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'isValid',
          value: true,
          inputType: 'checkbox'
        },
      ],
      ReviewsSectionProps: [
      ],
      ContactSectionProps: [
      ],
      PartnersSectionProps: [
      ],
      DifferencesSectionProps: [
      ],
      TeaserSectionProps: [
      ],
      InputMaterialProps: [
        {
          label: 'value',
          value: `Fonction`,
          inputType: 'text'
        },
        {
          label: 'error',
          value: `La fonction est requise`,
          inputType: 'text'
        },
        {
          label: 'isValid',
          value: `Hello`,
          inputType: 'text'
        },
        {
          label: 'required',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'placedLabel',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'textArea',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'type',
          value: `Hello`,
          inputType: 'text'
        },
        {
          label: 'inputId',
          value: `1`,
          inputType: 'text'
        },
      ],
      SelectMaterialProps: [
        {
          label: 'value',
          value: `Fonction`,
          inputType: 'text'
        },
        {
          label: 'error',
          value: ``,
          inputType: 'text'
        },
        {
          label: 'isValid',
          value: `Hellosssss`,
          inputType: 'text'
        },
        {
          label: 'options',
          value: [ { label: 'GarageScore' }, { label: 'Manager' }, { label: 'E-Reputation' }, { label: 'Automation' }, { label: 'XLeads' } ],
          inputType: 'json',
        },
        {
          label: 'required',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'placedLabel',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'placeholder',
          value: `Liste des produits`,
          inputType: 'text'
        },
        {
          label: 'small',
          value: false,
          inputType: 'checkbox'
        },
      ],
      SelectBasicProps: [
        {
          label: 'value',
          value: `Fonction`,
          inputType: 'text'
        },
        {
          label: 'options',
          value: [ { value: 'GarageScore' }, { value: 'Manager' }, { value: 'E-Reputation' }, { value: 'Automation' }, { value: 'XLeads' } ],
          inputType: 'json',
        },
        {
          label: 'multi',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'validateEvent',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'size',
          value: `500px`,
          inputType: 'text'
        },
      ],
      ToggleProps: [
        {
          label: 'type',
          value: `Fonction`,
          inputType: 'text'
        },
        {
          label: 'value',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'disabled',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'title',
          value: `Toggle`,
          inputType: 'text'
        },
      ],
      KPIProps: [
        {
          label: 'value',
          value: 12,
          inputType: 'number',
        },
        {
          label: 'hoverTitle',
          value: `Tooltip`,
          inputType: 'text'
        },
        {
          label: 'dangerValue',
          value: 10,
          inputType: 'number',
        },
        {
          label: 'warningValue',
          value: 30,
          inputType: 'number',
        },
        {
          label: 'neutralValue',
          value: 50,
          inputType: 'number',
        },
        {
          label: 'positiveValue',
          value: 70,
          inputType: 'number',
        },
        {
          label: 'isPercent',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'reverse',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'noMainValue',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'goldOnly',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'blueOnly',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'small',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'generalStatsLabel',
          value: `Toggle`,
          inputType: 'text'
        },
        {
          label: 'decimal',
          value: 50,
          inputType: 'number',
        },
        {
          label: 'noBottom',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'noInfo',
          value: false,
          inputType: 'checkbox'
        },
        {
          label: 'loading',
          value: false,
          inputType: 'checkbox'
        },
      ],
      StatsAutomationConvertedProps: [
        {
          label: 'automationCountOpened',
          value: 779,
          inputType: 'number',
        },
        {
          label: 'automationCountConverted',
          value: 92,
          inputType: 'number',
        },
        {
          label: 'loading',
          value: false,
          inputType: 'checkbox'
        },
      ],
      StatsAutomationOpenedProps: [
        {
          label: 'automationCountSent',
          value: 12,
          inputType: 'number',
        },
        {
          label: 'automationCountOpened',
          value: 2,
          inputType: 'number',
        },
        {
          label: 'loading',
          value: false,
          inputType: 'checkbox'
        },
      ],
      StatsAutomationSentProps: [
        {
          label: 'automationCountSent',
          value: 157,
          inputType: 'number',
        },
        {
          label: 'loading',
          value: false,
          inputType: 'checkbox'
        },
      ],
      HeaderNavFolderProps: [
        {
          label: 'contentTypeLabel',
          value: 'Campaigns',
          inputType: 'text',
        },
        {
          label: 'items',
          value: [{ id: '1' }, { id: '2'}, {id: '3'}],
          inputType: 'json',
        },
        {
          label: 'customIdLabel',
          value: 'target',
          inputType: 'text'
        },
        {
          label: 'currentId',
          value: '1',
          inputType: 'text'
        },
        {
          label: 'routeId',
          value: '',
          inputType: 'text'
        },
        {
          label: 'routeList',
          value: 'cockpit-leads-reviews',
          inputType: 'text'
        },
        {
          label: 'sidebarTiny',
          value: true,
          inputType: 'checkbox'
        }
      ],
      CardFolderResumeProps: [
        {
          label: 'id',
          value: '605cbe33a5fc00859575e92e',
          inputType: 'text'
        },
        {
          label: 'source',
          value: {
            type: "ManualLead",
            by: null,
            agent: null
          },
          inputType: 'json',
        },
        {
          label: 'garage',
          value: {
            publicDisplayName: "Brest Automobiles (Toyota Brest)",
          },
          inputType: 'json',
        },
        {
          label: 'review',
          value: {},
          inputType: 'json',
        },
        {
          label: 'leadTicket',
          value: {
            status:"WaitingForMeeting",
            createdAt:"2021-03-25T16:45:39.288Z",
            closedAt:"2021-03-25T17:06:07.227Z",
            saleType:"NewVehicleSale",
            sourceSubtype:null,
            customer: { "fullName":"Hug dza","contact":{"mobilePhone":"+33606060606","email":"zadza@daazds.com"}},
          },
          inputType: 'json',
        },
        {
          label: 'automationCampaign',
          value: {},
          inputType: 'json',
        },
        {
          label: 'openModalDispatch',
          value: (payload) => {
            alert(`[openModalDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
      ],
      GaugeProps: [
        {
            label: "value",
            value: 9,
            inputType: 'text'
        },
        {
            label: 'nobg',
            value: false,
            inputType: 'checkbox'
        },
        {
            label: 'inFolder',
            value: true,
            inputType: 'checkbox'
        }
      ],
      TextEmphasisProps: [
        {
            label: "text",
            value: "Hello, This is John, John is a nice guy, be like John",
            inputType: "text"
        },
        {
            label: "limit",
            value: 30,
            inputType: "number"
        },
        {
            label: "align",
            value: "center",
            inputType: "text"
        },
        {
            label: "classComment",
            value: "primary",
            inputType: "text"
        }
      ],
      StepsLeadProps: [
        {
          label: 'leadTicket',
          value: {
            status: "WaitingForContact",
            saleType: "NewVehicleSale",
            actions: [{
                "name": "customerCall",
                "createdAt": "2021-03-29T10:51:24.856Z",
              },
              {
                "name": "leadStarted",
                "createdAt": "2021-03-29T10:42:17.244Z",
              }
            ],
          },
          inputType: 'json'
        },
        {
          label: 'source',
          value: {
            type: 'ManualLead',
          },
          inputType: 'json'
        }
      ],
      StepsItemSimpleProps: [
        {
          label: "title",
          value: "Contacting",
          inputType: "text"
        },
        {
          label: "icon",
          value: "icon-gs-help-customer-support",
          inputType: "select",
          inputOptions: [
            "icon-gs-car-repair",
            "icon-gs-help-customer-support",
            "icon-gs-calendar",
            "icon-gs-cash-bag-euro",
            "icon-gs-validation-check-circle",
          ]
        },
        {
          label: "status",
          value: "create",
          inputType: "text"
        },
        {
          label: "value",
          value: "value1",
          inputType: "text"
        },
        {
          label: "type",
          value: 'primary',
          inputType: "select",
          inputOptions: [
            "danger",
            "primary",
            "success",
            "warning",
          ]
        }
      ],
      CardCustomerInfoProps: [
        {
            label: "id",
            "value": "6061d74d52b005b26983cffe",
            "inputType": "text"
        },
        {
            label: "leadTicket",
            "value": {
              "vehicle": {
                "makeModel": "Bentley",
                "plate": "ERT-TUY"
              },
              "customer": {
                "fullName": "Jean Neymar",
                "contact": {
                  "mobilePhone": "+33606066060",
                  "email": "jean@neymar.com"
                }
              },
            },
            "inputType": "json"
        },
        {
          label: 'updateTicketDispatch',
          value: (payload) => {
            alert(`[updateTicketDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
      ],
      PlaceholderLoadingProps: [
        {
            label: "logo",
            value: "Facebook",
            inputType: "text"
        },
        {
            label: "absolute",
            value: false,
            inputType: "checkbox",
            comment: "if you use it you might have to reload the page"
        },
        {
            label: "fullScreen",
            value: false,
            inputType: "checkbox"
        },
      ],
      CardPurchaseProjectProps: [
        {
          label: 'id',
          value: '6061d74d52b005b26983cffe',
          inputType: 'text'
        },
        {
          label: 'leadTicket',
          value: {
            timing:"MidTerm",
            saleType:"NewVehicleSale",
            energyType: ["electric","diesel"],
            cylinder: [],
            brandModel: 'Toyoto',
            bodytype: ['monospace'],
            budget: 100,
            financing: 'leasing',
            tradeIn: 'YesOther',
          },
          inputType: 'json'
        },
        {
          label: 'garage',
          value: { type: 'Dealership' },
          inputType: 'json'
        },
        {
          label: 'updateTicketDispatch',
          value: (payload) => {
            this[`${this.activeComponent}Props`][1].value[payload.field.split('.')[1]] = payload.value
            alert(`[updateTicketDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
      ],
      FieldGroupProps: [
        {
          label: 'canBeClose',
          value: true,
          inputType: 'checkbox',
        },
      ],
      CardFolderManagementProps: [
        {
          label: 'ticketId',
          value: '5678',
          inputType: 'text'
        },
        {
          label: 'id',
          value: '1234',
          inputType: 'text'
        },
        {
          label: 'firstName',
          value: 'Valery',
          inputType: 'text'
        },
        {
          label: 'lastName',
          value: 'Giscard d\'Estaing',
          inputType: 'text'
        },
        {
          label: 'email',
          value: 'valery.giscard@destaing.com',
          inputType: 'text'
        },
        {
          label: 'folderManagementComponent',
          value: "WizardLeadsFolder",
          inputType: 'select',
          inputOptions: [
            "WizardLeadsFolder",
            "WizardUnsatisfiedFolder"
          ],
        },
        {
          label: 'garage',
          value: {
            id:"5665922cd6c403604b655e46",
            type:"Dealership",
            publicDisplayName:"Premium Automobiles (Land Rover Volvo Troyes)",
            users:[]
          },
          inputType: 'json',
        },
        {
          label: 'leadTicket',
          value: {
            saleType:"UsedVehicleSale",
            manager: {
              id:"managerId"
            },
          },
          inputType: 'json'
        },
        {
          label: 'updateTicketDispatch',
          value: (payload) => {
            alert(`[updateTicketDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
        {
          label: 'addTicketActionDispatch',
          value: (payload) => {
            alert(`[addTicketActionDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
        {
          label: 'openModalDispatch',
          value: (payload) => {
            alert(`[openModalDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
        {
          label: 'appendTicketUserDispatch',
          value: (payload) => {
            alert(`[appendTicketUserDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
        {
          label: 'ticketManagerId',
          value: '3',
          inputType: 'text',
          comment: "Cette valeur (1 à 3) permet de désigner l'utilisateur en déjà charge du dossier et ainsi de le disable au clic"
        },
      ],
      WizardLeadsFolderProps: [
        {
          label: 'id',
          value: '1234',
          inputType: 'text',
        },
        {
          label: 'garage',
          value: {
            id:"5665922cd6c403604b655e46",
            type:"Dealership",
            publicDisplayName:"Premium Automobiles (Land Rover Volvo Troyes)",
            users:[]
          },
          inputType: 'json',
        },
        {
          label: 'leadTicket',
          value: {
            saleType:"UsedVehicleSale",
            manager: {
              id:"managerId"
            },
          },
          inputType: 'json',
        },
        {
          label: 'updateTicketDispatch',
          value: (payload) => {
            alert(`[updateTicketDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
        {
          label: 'addTicketActionDispatch',
          value: (payload) => {
            alert(`[addTicketActionDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
        {
          label: 'openModalDispatch',
          value: (payload) => {
            alert(`[openModalDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
        {
          label: 'appendTicketUserDispatch',
          value: (payload) => {
            alert(`[appendTicketUserDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
      ],
      WizardStepCommentProps: [
        {
          label: 'value',
          value: 'Bien le bonjour je suis un commentaire tout mignon',
          inputType: 'text'
        },
        {
          label: 'loading',
          value: true,
          inputType: 'checkbox'
        }
      ],
      WizardStepPlanProps: [],
      WizardStepTransfertProps: [
        {
          label: 'users',
          value: [
            {
              id:'1',
              email: 'agent-uno@email.com',
              job: 'Agent'
            },
            {
              id:'2',
              email: 'email-dos@email.com',
              job: 'Agent2',
              hasOnlyThisGarage: true
            },
            {
              id:'3',
              email: 'hello-dos@email.com',
              job: 'Agent3',
              isTicketManger: true
            },
          ],
          inputType: 'json'
        },
        {
          label: 'value',
          value: '2',
          inputType: 'text',
          comment: "changer cette valeur de 1 à 2 pour changer le garage 'cliqué'"
        },
        {
          label: 'type',
          value: 'leads',
          inputType: 'text'
        },
        {
          label: 'garageId',
          value: '1111',
          inputType: 'text'
        },
        {
          label: 'garageDisplayName',
          value: 'Mon petit garage',
          inputType: 'text'
        },
        {
          label: 'openModalDispatch',
          value: (payload) => {
            alert(`[openModalDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        },
        {
          label: 'appendTicketUserDispatch',
          value: (payload) => {
            alert(`[appendTicketUserDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        }
      ],
      WizardStepCloseLeadProps: [
        {
          label: 'value',
          value: 'Sold',
          inputType: 'select',
          inputOptions: ['Lost', 'Sold']
        },
        {
          label: 'isAMaintenanceLead',
          value: true,
          inputType: 'checkbox',
        }
      ],
      WizardStepCloseLeadDetailProps: [
        {
          label: 'value',
          value: 'CanceledLead',
          inputType: 'select',
          inputOptions: [
            'CanceledLead',
            'PostponedLead',
            'UnacquiredFunding',
            'LowTradeIn',
            'UnattractiveOffer',
            'AvailabilityProblem',
            'UnsuitableVehicleCategory',
            'NotSeriousCustomer',
            '---',
            'APV_RdvNotWanted',
            'APV_AvailabilityTooFar',
            'APV_AlreadyDone',
            'APV_AlreadyDoneInAOtherGarage',
            'APV_Postponed',
            'APV_Others',
            '---',
            'NewVehicleSale',
            'UsedVehicleSale',
          ]
        },
        {
          label: 'type',
          value: 'Lost',
          inputType: 'select',
          inputOptions: ['Lost', 'Sold']
        },
        {
          label: 'isAMaintenanceLead',
          value: false,
          inputType: 'checkbox',
        }
      ],
      HistoryTicketProps: [
        {
          label: 'actions',
          value: [
            {
              createdAt:"2021-03-30T13:38:04.548Z",
              assigner: {
                email:"email2@test2.com",
                firstName:"Louis",
                id:"2",
                lastName:"XIV",
              },
              name: "reminder",
              reminderActionName: "meeting",
              reminderDate: "2022-04-14T00:00:00.000Z",
              reminderFirstDay: 19096,
              reminderNextDay: 19096,
              reminderStatus: "NotResolved",
            },
            {
              comment:"Je suis un commentaire",
              createdAt:"2021-03-30T13:18:00.414Z",
              assigner: {
                email:"email@test.com",
                firstName:"Philippe",
                id:"1",
                lastName:"Etchebest",
              },
              name:"proposition",
            },
            {
              createdAt:"2021-03-30T13:17:29.782Z",
              assigner: {
                email:"email2@test2.com",
                firstName:"Louis",
                id:"2",
                lastName:"XIV",
              },
              name:"customerCall",
            },
            {
              createdAt: "2021-03-30T07:52:59.357Z",
              isManual: true,
              name: "leadStarted",
              ticketManager: {
                email:"email@test.com",
                firstName:"Philippe",
                id:"1",
                lastName:"Etchebest",
              },
            },
          ],
          inputType: 'json'
        },
        {
          label: 'id',
          value: '3',
          inputType: 'text'
        },
        {
          label: 'type',
          value: 'lead',
          inputType: 'text'
        },
        {
          label: 'agentGarageName',
          value: 'Mon incroyable garage',
          inputType: 'text'
        },
        {
          label: 'automationCampaign',
          value: {},
          inputType: 'json'
        },
        {
          label: 'leadTicketSaleType',
          value: 'UsedVehicleSale',
          inputType: 'text'
        },
        {
          label: 'cockpitType',
          value: 'Dealership',
          inputType: 'text'
        },
        {
          label: 'cancelReminderDispatch',
          value: (payload) => {
            alert(`[cancelReminderDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        }
      ],
      HistoryTicketItemProps: [
        {
          label: 'ticketId',
          value: '1',
          inputType: 'text'
        },
        {
          label: 'type',
          value: 'lead',
          inputType: 'text',
        },
        {
          label: 'agentGarageName',
          value: 'Agent garage Name',
          inputType: 'text',
        },
        {
          label: 'action',
          value: {
              createdAt:"2021-03-30T13:38:04.548Z",
              assigner: {
                email:"email2@test2.com",
                firstName:"Louis",
                id:"2",
                lastName:"XIV",
              },
              name: "reminder",
              reminderActionName: "meeting",
              reminderDate: "2022-04-14T00:00:00.000Z",
              reminderFirstDay: 19096,
              reminderNextDay: 19096,
              reminderStatus: "NotResolved",
            },
          inputType: 'json',
        },
        {
          label: 'automationCampaign',
          value: {},
          inputType: 'json'
        },
        {
          label: 'leadTicketSaleType',
          value: 'UsedVehicleSale',
          inputType: 'text'
        },
        {
          label: 'cockpitType',
          value: 'Dealership',
          inputType: 'text'
        },
        {
          label: 'cancelReminderDispatch',
          value: (payload) => {
            alert(`[cancelReminderDispatch Func]
              payload ${JSON.stringify(payload)}`);
          },
        }
      ],
};
