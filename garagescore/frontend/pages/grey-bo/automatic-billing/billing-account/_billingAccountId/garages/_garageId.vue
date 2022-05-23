<template>
  <section id="garage-details-page-wrapper">
    <template>
      <!-- WHEN THE GARAGE IS LOADED -->
      <!-- check garage id because default garage prop is empty object -->
      <!-- we only display once the garage is loaded -->
      <div v-if="garage.id">
        <!-- FIRST BLOCK, GARAGE CURRENT INFO & SUB -->
        <div class="garage-details">
          <h3>{{ garage.publicDisplayName }}</h3>

          <!-- OVERALL INFORMATION ABOUT THE GARAGE -->
          <div class="row garage-details-information">
            <!-- Left Block -->
            <div class="col-xs-12 col-md-8">
              <div class="garage-details-info">
                <span class="garage-details-info-question">Identifiant interne:</span>
                <span class="garage-details-info-answer">{{ garage.id }}</span>
              </div>
              <div class="garage-details-info">
                <span class="garage-details-info-question">Nom:</span>
                <span class="garage-details-info-answer">{{ garage.publicDisplayName }}</span>
              </div>
              <div class="garage-details-info">
                <span class="garage-details-info-question">Slug:</span>
                <span class="garage-details-info-answer">{{ garage.slug }}</span>
              </div>
              <div class="garage-details-info">
                <span class="garage-details-info-question">Compte de facturation associé:</span>
                <span class="garage-details-info-answer click-answer" @click="goToBillingAccount()">{{
                  billingAccount.name
                }}</span>
              </div>
              <div class="garage-details-info">
                <span class="garage-details-info-question">Prochaine échéance de facturation:</span>
                <span class="garage-details-info-answer">{{ prettifyDateTime(billingAccount.dateNextBilling) }}</span>
              </div>
              <div class="garage-details-info">
                <span class="garage-details-info-question"
                  >Utilisateurs automatiquement assignés par type de dossier:</span
                >
                <span class="garage-details-info-answer"
                  ><button class="btn btn-xs btn-primary" @click="configureAutoAssignedUsers()">
                    <i class="icon-gs-cog"></i>&nbsp;Configurer
                  </button></span
                >
              </div>
            </div>
            <div class="col-xs-12 col-md-4">
              <div class="garage-details-info">
                <span>BizDev : </span>
                <span>{{ actualBizDev ? actualBizDev.email : 'Personne' }}</span>
              </div>
              <div class="garage-details-info">
                <span>Performer : </span>
                <span>{{ actualPerformer ? actualPerformer.email : 'Personne' }}</span>
              </div>
              <div class="garage-details-info">
                <span>Statut du garage : </span>
                <span>{{ displayStatus(garage.status) }}</span>
              </div>
              <button
                @click="launchGarage()"
                v-if="isAllowedToLaunch"
                class="btn btn-xs btn-warning"
              >
                <i class="icon-gs-alertes"></i>&nbsp;&nbsp;&nbsp;Lancer le garage en automatique
              </button>
              <span
                style="padding: 0;"
                class="garage-details-info-answer garage-details-info-answer-with-problem"
                v-if="garage.status === GarageStatus.READY && !activeSubscription.priceValidated"
                >Le montant de l'abonnement n'a pas été validé</span
              >
              <span
                style="padding: 0;"
                class="garage-details-info-answer garage-details-info-answer-with-problem"
                v-if="garage.status === GarageStatus.READY && !isParentTicketsConfigurationWellFilled"
              >Le partage de projet d'achat n'est pas possible car le garage parent n'a pas les utilisateurs correctement associés par type de dossier</span
              >
            </div>
          </div>

          <!-- ACTIONS BUTTONS ABOUT THE GARAGE -->
          <!--<div class="garages-details-actions">
            <button @click="action_removeGarageFromBillingAccount(garage)" class="btn btn-xs btn-warning">
              <i class="icon-gs-unlock"></i>&nbsp;Dissocier
            </button>
            &nbsp;
            <button @click.prevent="goToBillingAccount()" class="btn btn-primary btn-xs">
              <i class="icon-gs-arrow-left"></i>&nbsp;Retour Compte
            </button>
          </div>-->
        </div>

        <!-- FIRST BLOCK, CREATE OR UPDATE THE CURRENT SUBSCRIPTION -->
        <div v-if="garage.subscriptions" class="garage-active-subscription-wrapper">
          <div class="garage-active-subscription-create">
            <h5 v-if="activeSub">Éditer l'abonnement</h5>
            <h5 v-else>Créer un nouvel abonnement</h5>
            <div>
              <form class="form-inline">
                <!-- Auto Fill -->
                <div class="subscription-field auto-fill">
                  <span class="field-title">Préremplir avec l'offre :</span>
                  <select class="form-control input-sm" @change="loadSubScenario" v-model="selectedSubScenario">
                    <option disabled selected hidden value="">Choisir une offre</option>
                    <option
                      v-for="(scenario, scnearioIndex) in subScenarios"
                      :value="scnearioIndex"
                      :key="scnearioIndex"
                      >{{ scenario.name }}</option
                    >
                  </select>
                </div>
                <!-- Startinig Date -->
                <div class="subscription-field">
                  <span class="field-title">Date de démarrage :</span>
                  <select
                    v-if="!activeSub"
                    :class="'form-control input-sm date-start-' + (garage.subscriptions.dateStart ? 'ok' : 'error')"
                    v-model="activeSubscription.dateStart"
                    @change="calcSetupBillDate()"
                  >
                    <option disabled selected hidden value="">Choisir une date de démarrage</option>
                    <option
                      v-for="(dateStartChoice, index) in dateStartChoices"
                      :value="dateStartChoice.v"
                      :key="index"
                      >{{ dateStartChoice.d }}</option
                    >
                  </select>
                  <label v-else>{{ prettifyDate(activeSubscription.dateStart) }}</label>
                </div>
                <!-- Setup Price -->
                <div class="subscription-field" v-if="!activeSubscription.setup.alreadyBilled">
                  <div class="field-title">
                    Prix de démarrage (setup) :
                    <switch-button
                      :value="activeSubscription.setup.enabled"
                      @change="toggleActiveSubscriptionField('setup')"
                    ></switch-button>
                  </div>
                  <div style="display: inline-block;" v-show="activeSubscription.setup.enabled">
                    <div class="input-group">
                      <input
                        class="form-control input-sm"
                        v-model.number="activeSubscription.setup.price"
                        type="number"
                        step="1"
                        min="0"
                        max="1000"
                      />
                      <div class="input-group-addon">€</div>
                    </div>
                    &nbsp;Facturé le&nbsp;
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.setup.monthOffset"
                      @change="calcSetupBillDate()"
                      type="number"
                      step="1"
                      min="1"
                      max="1000"
                    />
                    &nbsp;Éme mois, soit le&nbsp;
                    <label v-if="activeSubscription.setup.billDate">{{
                      prettifyDate(activeSubscription.setup.billDate)
                    }}</label>
                    <label v-else>Veuillez choisir une date de démarrage pour l'abonnement !</label>
                  </div>
                </div>
                <div class="subscription-field" v-else>
                  <span class="field-title">Prix de démarrage (setup) :</span>
                  <label
                    >{{ activeSubscription.setup.price }} €, Facturé le
                    {{ prettifyDate(activeSubscription.setup.billDate) }}</label
                  >
                </div>

                <!-- Manager -->
                <div class="garage-details-page-wrapper__header">
                  <img class="garage-details-page-wrapper__logo" src="/logo/logo-custeed-manager-picto.svg" />
                  <h3>Manager</h3>
                </div>

                <!-- Subscription -->
                <div
                  class="subscription-field"
                  v-for="subscriptionType in subscriptionTypes.filter(
                    (subscriptionType) => subscriptionType === 'Analytics'
                  )"
                  v-bind:key="subscriptionType"
                >
                  <div class="field-title">
                    Abonnement :
                    <switch-button
                      v-if="isCrossLeadsSourcedEnabled(subscriptionType)"
                      @click="notifyIsCrossLeadsSourcedEnabled"
                      :value="true"
                    ></switch-button>
                    <switch-button
                      v-else
                      :value="activeSubscription[subscriptionType].enabled"
                      @change="toggleActiveSubscriptionField(subscriptionType)"
                    ></switch-button>
                  </div>
                  <div class="input-group" v-show="activeSubscription[subscriptionType].enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription[subscriptionType].price"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                      @change="toggleActiveSubscriptionPriceField(subscriptionType)"
                    />
                    <div class="input-group-addon">€ / Mois</div>
                  </div>
                </div>
                <!-- Lead -->
                <div
                  class="subscription-field"
                  v-for="subscriptionType in subscriptionTypes.filter(
                    (subscriptionType) => subscriptionType === 'Lead'
                  )"
                  v-bind:key="subscriptionType"
                >
                  <div class="field-title">
                    {{ subscriptionType }} :
                    <switch-button
                      v-if="isCrossLeadsSourcedEnabled(subscriptionType)"
                      @click="notifyIsCrossLeadsSourcedEnabled"
                      :value="true"
                    ></switch-button>
                    <switch-button
                      v-else
                      :value="activeSubscription[subscriptionType].enabled"
                      @change="toggleActiveSubscriptionField(subscriptionType)"
                    ></switch-button>
                  </div>
                  <div class="input-group" v-show="activeSubscription[subscriptionType].enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription[subscriptionType].price"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                      @change="toggleActiveSubscriptionPriceField(subscriptionType)"
                    />
                    <div class="input-group-addon">€ / Mois</div>
                  </div>
                </div>

                <div class="subscription-field" style="padding: 0 0 0 1rem; min-height: 0;">
                  <i class="icon-gs-alert-warning-circle field-icon"></i>
                  <span class="field-subtitle"
                    >Option à activer dès qu'il y a des leads à gérer, qu'ils viennent de GS, XL, AM, ...</span
                  >
                </div>

                <!-- Coaching -->
                <div
                  class="subscription-field"
                  v-for="subscriptionType in subscriptionTypes.filter(
                    (subscriptionType) => subscriptionType === 'Coaching'
                  )"
                  v-bind:key="subscriptionType"
                >
                  <div class="field-title">
                    {{ subscriptionType }} :
                    <switch-button
                      v-if="isCrossLeadsSourcedEnabled(subscriptionType)"
                      @click="notifyIsCrossLeadsSourcedEnabled"
                      :value="true"
                    ></switch-button>
                    <switch-button
                      v-else
                      :value="activeSubscription[subscriptionType].enabled"
                      @change="toggleActiveSubscriptionField(subscriptionType)"
                    ></switch-button>
                  </div>
                  <div class="input-group" v-show="activeSubscription[subscriptionType].enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription[subscriptionType].price"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                      @change="toggleActiveSubscriptionPriceField(subscriptionType)"
                    />
                    <div class="input-group-addon">€ / Mois</div>
                  </div>
                </div>

                <!-- Connect -->
                <div
                  class="subscription-field"
                  v-for="subscriptionType in subscriptionTypes.filter(
                    (subscriptionType) => subscriptionType === 'Connect'
                  )"
                  v-bind:key="subscriptionType"
                >
                  <div class="field-title">
                    {{ subscriptionType }} :
                    <switch-button
                      v-if="isCrossLeadsSourcedEnabled(subscriptionType)"
                      @click="notifyIsCrossLeadsSourcedEnabled"
                      :value="true"
                    ></switch-button>
                    <switch-button
                      v-else
                      :value="activeSubscription[subscriptionType].enabled"
                      @change="toggleActiveSubscriptionField(subscriptionType)"
                    ></switch-button>
                  </div>
                  <div class="input-group" v-show="activeSubscription[subscriptionType].enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription[subscriptionType].price"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                    />
                    <div class="input-group-addon">€ / Mois</div>
                  </div>
                </div>

                <!-- Users -->
                <div class="subscription-field">
                  <span class="field-title">Utilisateurs :</span>
                  <div class="input-group">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.users.included"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                    />
                    <div class="input-group-addon">Inclus</div>
                  </div>
                  <span>&nbsp;Puis&nbsp;</span>
                  <div class="input-group">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.users.price"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                    />
                    <div class="input-group-addon">€ / Unité</div>
                  </div>
                  <div class="input-group">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.users.maximumTotalPriceForUsers"
                      type="number"
                      step=".1"
                      min="0"
                      max="500"
                    />
                    <div class="input-group-addon">€ Max</div>
                  </div>
                </div>

                <!-- GarageScore -->
                <div class="garage-details-page-wrapper__header">
                  <img class="garage-details-page-wrapper__logo" src="/logo/logo-custeed-garagescore-picto.svg" />
                  <h3>GarageScore</h3>
                </div>

                <div
                  class="subscription-field"
                  v-for="subscriptionType in subscriptionTypes.filter(
                    (subscriptionType) =>
                      subscriptionType !== 'Automation' &&
                      subscriptionType !== 'CrossLeads' &&
                      subscriptionType !== 'Lead' &&
                      subscriptionType !== 'EReputation' &&
                      subscriptionType !== 'Analytics' &&
                      subscriptionType !== 'Coaching' &&
                      subscriptionType !== 'Connect'
                  )"
                  v-bind:key="subscriptionType"
                >
                  <div class="field-title">
                    {{ subscriptionType }} :
                    <switch-button
                      v-if="isCrossLeadsSourcedEnabled(subscriptionType)"
                      @click="notifyIsCrossLeadsSourcedEnabled"
                      :value="true"
                    ></switch-button>
                    <switch-button
                      v-else
                      :value="activeSubscription[subscriptionType].enabled"
                      @change="toggleActiveSubscriptionField(subscriptionType)"
                    ></switch-button>
                  </div>
                  <div class="input-group" v-show="activeSubscription[subscriptionType].enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription[subscriptionType].price"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                      @change="toggleActiveSubscriptionPriceField(subscriptionType)"
                    />
                    <div class="input-group-addon">€ / Mois</div>
                  </div>
                </div>
                <!-- Contacts -->
                <div class="subscription-field">
                  <span class="field-title">Modèle de coût contact :</span>
                  <select class="form-control input-sm" v-model="activeSubscription.contacts.bundle">
                    <option :value="false">À l'unité</option>
                    <option :value="true">Tous les 100 contacts</option>
                  </select>
                </div>
                <div class="subscription-field">
                  <span class="field-title">Contacts :</span>
                  <div class="input-group">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.contacts.included"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                    />
                    <div class="input-group-addon">Inclus</div>
                  </div>
                  <span>&nbsp;Puis&nbsp;</span>
                  <div class="input-group">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.contacts.price"
                      type="number"
                      step="0.01"
                      min="0"
                      max="50"
                    />
                    <div class="input-group-addon">
                      € {{ activeSubscription.contacts.bundle ? 'tous les 100 contacts' : 'par contact' }}
                    </div>
                  </div>
                </div>

                <!-- E-Réputation -->
                <div class="garage-details-page-wrapper__header">
                  <img class="garage-details-page-wrapper__logo" src="/logo/logo-custeed-e-reputation-picto.svg" />
                  <h3>E-Réputation</h3>
                </div>

                <div
                  class="subscription-field"
                  v-for="subscriptionType in subscriptionTypes.filter(
                    (subscriptionType) => subscriptionType === 'EReputation'
                  )"
                  v-bind:key="subscriptionType"
                >
                  <div class="field-title">
                    {{ subscriptionType }} :
                    <switch-button
                      v-if="isCrossLeadsSourcedEnabled(subscriptionType)"
                      @click="notifyIsCrossLeadsSourcedEnabled"
                      :value="true"
                    ></switch-button>
                    <switch-button
                      v-else
                      :value="activeSubscription[subscriptionType].enabled"
                      @change="toggleActiveSubscriptionField(subscriptionType)"
                    ></switch-button>
                  </div>
                  <div class="input-group" v-show="activeSubscription[subscriptionType].enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription[subscriptionType].price"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                      @change="toggleActiveSubscriptionPriceField(subscriptionType)"
                    />
                    <div class="input-group-addon">€ / Mois</div>
                  </div>
                </div>

                <!-- XLeads -->
                <div class="garage-details-page-wrapper__header">
                  <img class="garage-details-page-wrapper__logo" src="/logo/logo-custeed-xlead-picto.svg" />
                  <h3>XLeads</h3>
                </div>

                <div
                  class="subscription-field"
                  v-for="subscriptionType in subscriptionTypes.filter(
                    (subscriptionType) => subscriptionType === 'CrossLeads'
                  )"
                  v-bind:key="subscriptionType"
                >
                  <div class="field-title">
                    XLeads :
                    <switch-button
                      v-if="isCrossLeadsSourcedEnabled(subscriptionType)"
                      @click="notifyIsCrossLeadsSourcedEnabled"
                      :value="true"
                    ></switch-button>
                    <switch-button
                      v-else
                      :value="activeSubscription[subscriptionType].enabled"
                      @change="toggleActiveSubscriptionField(subscriptionType)"
                    ></switch-button>
                  </div>
                  <div class="input-group" v-show="activeSubscription[subscriptionType].enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription[subscriptionType].price"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                      @change="toggleActiveSubscriptionPriceField(subscriptionType)"
                    />
                    <div class="input-group-addon">€ / Mois</div>
                  </div>

                  <div
                    v-if="subscriptionType === 'CrossLeads' && activeSubscription[subscriptionType].enabled"
                    class="cross-leads"
                  >
                    <div class="input-group">
                      <input
                        class="form-control input-sm"
                        v-model.number="activeSubscription.CrossLeads.included"
                        type="number"
                        step="1"
                        min="0"
                        max="500"
                      />
                      <div class="input-group-addon">Sources incluses</div>
                    </div>
                    <span>&nbsp;Puis&nbsp;</span>
                    <div class="input-group">
                      <input
                        class="form-control input-sm"
                        v-model.number="activeSubscription.CrossLeads.unitPrice"
                        type="number"
                        step="1"
                        min="0"
                        max="500"
                      />
                      <div class="input-group-addon">€ / Source</div>
                    </div>
                  </div>
                  <div
                    v-if="subscriptionType === 'CrossLeads' && activeSubscription[subscriptionType].enabled"
                    class="cross-leads-allow-mobile"
                  >
                    <span>Autoriser les portables:&nbsp;</span>
                    <switch-button
                      :value="!activeSubscription.CrossLeads.restrictMobile"
                      @change="toggleMobile()"
                    ></switch-button
                    >&nbsp;&nbsp;
                    <div class="input-group" v-show="!activeSubscription.CrossLeads.restrictMobile">
                      <input
                        class="form-control input-sm"
                        v-model.number="activeSubscription.CrossLeads.minutePrice"
                        type="number"
                        step="1"
                        min="0"
                        max="500"
                      />
                      <div class="input-group-addon">€ / minutes</div>
                    </div>
                  </div>
                </div>

                <!-- Automation -->
                <div class="garage-details-page-wrapper__header">
                  <img class="garage-details-page-wrapper__logo" src="/logo/logo-custeed-automation-picto.svg" />
                  <h3>Automation</h3>
                </div>

                <div class="subscription-field">
                  <span class="field-title"
                    >Automation :
                    <switch-button
                      :value="activeSubscription.Automation.enabled"
                      @change="toggleActiveSubscriptionField('Automation')"
                    ></switch-button>
                  </span>
                  <div class="input-group" v-if="activeSubscription.Automation.enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.Automation.price"
                      type="number"
                      step="1"
                      min="1"
                      max="500"
                      @change="toggleActiveSubscriptionPriceField('Automation')"
                    />
                    <div class="input-group-addon">de base</div>
                  </div>
                  <span v-if="activeSubscription.Automation.enabled">&nbsp;avec&nbsp;</span>
                  <div class="input-group" v-if="activeSubscription.Automation.enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.Automation.included"
                      type="number"
                      step="1"
                      min="0"
                      max="10000"
                    />
                    <div class="input-group-addon">contacts inclus</div>
                  </div>
                  <span v-if="activeSubscription.Automation.enabled">&nbsp;Puis&nbsp;</span>
                  <div class="input-group" v-if="activeSubscription.Automation.enabled">
                    <input
                      class="form-control input-sm"
                      v-model.number="activeSubscription.Automation.every"
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                    />
                    <div class="input-group-addon">€ / contacts</div>
                  </div>
                </div>
                <!-- HELLOFED temporary toggles for automation -->
                <div class="subscription-field">
                  <div class="field-title">
                    Automation APV :
                    <switch-button
                      :value="activeSubscription['AutomationApv'].enabled"
                      @change="toggleActiveSubscriptionField('AutomationApv')"
                    ></switch-button>
                  </div>
                </div>
                <div class="subscription-field">
                  <div class="field-title">
                    Automation VN :
                    <switch-button
                      :value="activeSubscription['AutomationVn'].enabled"
                      @change="toggleActiveSubscriptionField('AutomationVn')"
                    ></switch-button>
                  </div>
                </div>
                <div class="subscription-field">
                  <div class="field-title">
                    Automation VO :
                    <switch-button
                      :value="activeSubscription['AutomationVo'].enabled"
                      @change="toggleActiveSubscriptionField('AutomationVo')"
                    ></switch-button>
                  </div>
                </div>
                <div class="subscription-field" style="padding: 0 0 1rem 1rem; min-height: 0;">
                  <i class="icon-gs-alert-warning-circle field-icon"></i>
                  <span class="field-subtitle"
                    >Attention, les campagnes Automation ne seront actualisés qu'au lendemain de la modification des
                    souscriptions.</span
                  >
                </div>

                <!-- Annex -->
                <div class="garage-details-page-wrapper__header">
                  <img class="garage-details-page-wrapper__logo" src="/logo/logo-custeed-picto.svg" />
                  <h3>Miroir</h3>
                </div>

                <div class="subscription-field annex">
                  <div class="field-title">
                    Miroir d'un autre abonnement :
                    <switch-button :value="annexEnabled" @click="annexEnabled = !annexEnabled"></switch-button>
                  </div>
                  <multiselect
                    v-if="annexEnabled"
                    placeholder="Saisissez le nom, l'id ou le slug de l'établissement"
                    :custom-label="customLabel"
                    track-by="publicDisplayName"
                    v-model="selectedAnnexGarage"
                    :multiple="false"
                    :hide-selected="true"
                    select-label=""
                    :options="multiSelectGarages"
                  >
                  </multiselect>
                </div>
                <!-- PRICE CONFIRMATION -->
                <div class="subscription-field" v-if="isAdmin">
                  <div class="field-title">
                    Valider le prix de l'abonnement ?
                    <switch-button
                      :value="activeSubscription.priceValidated"
                      @change="activeSubscription.priceValidated = !activeSubscription.priceValidated"
                    ></switch-button>
                  </div>
                  <div class="input-group">
                    <label></label>
                  </div>
                </div>

                <!-- Churn / DownSale -->
                <div class="garage-details-page-wrapper__header">
                  <img class="garage-details-page-wrapper__logo" src="/logo/logo-custeed-churn-picto.svg" />
                  <h3>Churn / DownSale</h3>
                </div>

                <div class="subscription-field">
                  <div class="field-title">
                    Date effective
                  </div>
                  <div class="input-group">
                    <DatePicker
                        class="input-group-datepicker"
                        ref="datepicker"
                        placeholder="Définir une date"
                        :disabled-date="disabledEffectiveDate"
                        v-model="activeSubscription.churnEffectiveDate"
                        type="date"
                        format="DD-MM-YYYY"
                        @change="churnEffectiveDateIsValid(true)"
                      />
                    </div>
                </div>

                <div class="subscription-field" v-show="!!activeSubscription.churnEffectiveDate">
                  <div class="field-title">
                    Churn total
                  </div>
                  <div class="input-group">
                    <input  type="checkbox" @change="handleFullChurnChange(!activeSubscription.isFullChurn)" :checked="activeSubscription.isFullChurn"  />
                  </div>
                </div>

                <div
                  class="subscription-field"
                  v-for="subscriptionType in subscriptionTypes"
                  v-bind:key="makeChurnKey(subscriptionType)"
                  v-show="!!activeSubscription.churnEffectiveDate"
                >
                  <div class="field-title">
                    {{ subscriptionType === 'CrossLeads' ? 'XLeads'
                      : subscriptionType === 'Analytics' ? 'Manager' :
                        subscriptionType }}
                    <switch-button
                      v-if="initialActiveSubscription[subscriptionType].enabled"
                      :value="activeSubscription[subscriptionType].churn.enabled"
                      @change="toggleActiveSubscriptionChurnField(subscriptionType, !activeSubscription[subscriptionType].churn.enabled)"
                    ></switch-button>
                  </div>
                  <div class="input-group">
                    <div v-bind:style="{ 'visibility':
                       activeSubscription[subscriptionType].enabled !== initialActiveSubscription[subscriptionType].enabled ||
                      !activeSubscription[subscriptionType].churn.enabled ? 'hidden' : 'unset' }">
                      <input
                        class="form-control input-sm"
                        v-model.number="churn[subscriptionType]"
                        @change="updateDelta(subscriptionType)"
                        type="number"
                        step="1"
                        min="0"
                        max="500"
                      />
                      <div class="input-group-addon">€ / Mois</div>
                      <div class="input-group-addon input-group-addon-invisible" />
                    </div>
                    <div class="input-group-addon" v-show="initialActiveSubscription[subscriptionType].enabled && activeSubscription[subscriptionType].churn.delta">
                      {{ activeSubscription[subscriptionType].churn.delta > 0 ? '+' : '' }}{{ activeSubscription[subscriptionType].churn.delta }} € / Mois
                    </div>
                    <div class="input-group-addon input-group-addon-invisible" />
                  </div>
                </div>


                <!-- Buttons -->
                <div class="garage-active-subscription-create-action">
                  <button
                    v-if="!activeSub"
                    @click.prevent="createSubscription()"
                    :disabled="!canCreateSubscription()"
                    class="btn btn-primary btn-xs"
                  >
                    <i class="icon-gs-add"></i>&nbsp;Créer
                  </button>
                  <button
                    v-if="activeSub"
                    @click.prevent="updateSubscription()"
                    :disabled="!subHasChanges || !mirrorFullyFilled || !totalPrice || !hasAccessToGreybo || churnSubHasChangesAndIsWrong"
                    class="btn btn-primary btn-xs"
                  >
                    <i class="icon-gs-validation-check-circle"></i>&nbsp;Sauvegarder</button
                  >&nbsp;
                  <button
                    v-if="activeSub && isAdmin"
                    @click.prevent="terminateSubscription()"
                    :disabled="!isAdmin || isCrossLeadsSourcedEnabled(subscriptionType)"
                    class="btn btn-warning btn-xs"
                  >
                    <i class="icon-gs-trash"></i>&nbsp;Résilier
                  </button>
                  &nbsp;
                  <button @click.prevent="goToBillingAccount()" class="btn btn-primary btn-xs">
                    <i class="icon-gs-arrow-left"></i>&nbsp;Retour Compte
                  </button>
                </div>
                <div v-if="isCrossLeadsSourcedEnabled(subscriptionType)" class="text-center text-danger">
                  Il n'est pas possible de résilier, il y a encore au moins un traceur actif sur le garage!
                </div>
              </form>
            </div>
          </div>
        </div>
        <!-- !FIRST BLOCK, CREATE OR UPDATE THE CURRENT SUBSCRIPTION -->
        <!-- LAST BLOCK, PART 1, UPDATE GARAGE DATA -->
        <TabGarageModify
          :mirror="isMirror"
          class="garage-active-subscription-wrapper"
          :garage="garage"
          :action_updateGarage="action_updateGarage"
          :garages="garages"
        ></TabGarageModify>
        <!-- !LAST BLOCK, PART 1, UPDATE GARAGE DATA -->
      </div>

      <!-- WHEN ALL WENT WRONG -->
      <div v-else>
        Ce garage est inconnu ou n'appartient à aucun - ou à un autre - compte de facturation.<br />
        Veuillez vérifier votre URL.
      </div>
    </template>
  </section>
</template>

<script>
import SwitchButton from '~/components/automatic-billing/SwitchButton';
import SubscriptionScenarios from '~/util/SubscriptionScenarios';
import garageSubscriptionTypes from '~/utils/models/garage.subscription.type.js';
import TabGarageModify from '~/components/automatic-billing/details/TabGarageModify.vue';
import GarageStatus from '~/utils/models/garage.status.js';
import { buildQuery } from '~/util/graphql';
import { DEFAULT_MAX_TOTAL_PRICE_FOR_USERS } from '../../../../../../../common/lib/garagescore/automatic-billing/constants.js';
import { isEqual } from '~/util/object';

export default {
  components: { SwitchButton, TabGarageModify },
  props: {
    billingAccount: {
      type: Object,
      default: () => ({}),
    },
    garages: {
      type: Array,
      default: function () {
        return [];
      },
    },
    garage: {
      type: Object,
      default: () => ({}),
    },
    garageScoreBizDevsUsers: {
      type: Array,
      default: function () {
        return [];
      },
    },
    garageScorePerformersUsers: {
      type: Array,
      default: function () {
        return [];
      },
    },
    action_updateGarageTicketsConfig: {
      type: Function,
      required: true,
    },
    action_updateGarage: {
      type: Function,
      required: true,
    },
    action_createGarageSubscriptions: {
      type: Function,
      required: true,
    },
    action_stopGarageSubscriptions: {
      type: Function,
      required: true,
    },
    action_updateGarageSubscriptions: {
      type: Function,
      required: true,
    },
    action_updateGarageStatus: {
      type: Function,
      required: true,
    },
    action_fetchGarage: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      subHasChanges: false,
      GarageStatus: GarageStatus,
      subScenarios: SubscriptionScenarios,
      selectedSubScenario: '',
      activeSubscription: this.getBlankSubscription(),
      initialActiveSubscription: this.getBlankSubscription(), // backup of activeSubscription
      churn: {},
      annexEnabled: false,
      subscriptionTypes: garageSubscriptionTypes.values(),
      selectedPerformer: null,
      users: [],
      selectedAnnexGarage: this.getAnnexGarage(),
      parentGarage: {}
    };
  },
  watch: {
    'activeSubscription': {
      deep: true,
      handler: function(newValue) {
        this.subHasChanges = !isEqual(newValue, this.initialActiveSubscription);
      }
    }
  },
  computed: {
    multiSelectGarages() {
      return this.garages.filter((g) => g.id !== this.garage.id && !g.annexGarageId);
    },
    actualBizDev() {
      const actualBizDevId = (this.garage && this.garage.bizDevId) || null;
      if (actualBizDevId && this.garageScoreBizDevsUsers) {
        return this.garageScoreBizDevsUsers.find((u) => u.id === actualBizDevId);
      } else {
        return null;
      }
    },
    actualPerformer() {
      const actualPerformerId = (this.garage && this.garage.performerId) || null;
      if (actualPerformerId && this.garageScorePerformersUsers) {
        return this.garageScorePerformersUsers.find((u) => u.id === actualPerformerId);
      } else {
        return null;
      }
    },
    isAdmin() {
      return this.$store.state.auth.ACCESS_TO_DARKBO;
    },
    isMirror() {
      return !!this.garage.annexGarageId;
    },
    mirrorFullyFilled() {
      return !!this.annexEnabled === !!(this.garage.annexGarageId || this.selectedAnnexGarage);
    },
    garageStatus() {
      if (this.garage) {
        return GarageStatus.displayName(this.garage.status);
      }
    },
    activeSub() {
      return this.activeSubscription.active;
    },
    dateStartChoices: function () {
      const today = this.$moment().tz('Europe/Paris').hours(21).minutes(0).seconds(0).milliseconds(0);
      let date = this.$moment()
        .tz('Europe/Paris')
        .date(this.billingAccount.billingDate)
        .hours(21)
        .minutes(0)
        .seconds(0)
        .milliseconds(0);
      const res = [];

      if (date.isAfter(today)) {
        date.subtract(1, 'month');
        today.subtract(1, 'month');
      }
      if (date.isAfter(today, 'month')) {
        date = today.clone().endOf('month').hours(21).minutes(0).seconds(0).milliseconds(0);
      }
      if (new Date(date.toDate()) > new Date()) {
        res.push({ d: this.prettifyDate(date.toISOString()), v: date.toISOString() });
      }
      date.add(1, 'month').date(this.billingAccount.billingDate);
      today.add(1, 'month');
      if (date.isAfter(today, 'month')) {
        date = today.clone().endOf('month').hours(21).minutes(0).seconds(0).milliseconds(0);
      }
      if (new Date(date.toDate()) > new Date()) {
        res.push({ d: this.prettifyDate(date.toISOString()), v: date.toISOString() });
      }
      return res;
    },
    garageScoreBizDevsUsersSelect() {
      return this.garageScoreBizDevsUsers.map((user) => ({ label: user.email, value: user.id }));
    },
    totalPrice() {
      let total = 0;
      for (const subscription of garageSubscriptionTypes.values()) {
        if (this.activeSubscription[subscription].enabled) {
          total += this.activeSubscription[subscription].price;
        }
      }
      return total > 0;
    },
    churnSubHasChangesAndIsWrong() {
      let churnSubHasChanges = false;

      if (!this.activeSubscription.churnEffectiveDate) {
        return false;
      }

      // New Full churn status
      if (this.activeSubscription.isFullChurn !== this.initialActiveSubscription.isFullChurn) {
        churnSubHasChanges = true;
      }

      // New effective date
      if ((this.initialActiveSubscription.churnEffectiveDate
            && !this.$moment(this.activeSubscription.churnEffectiveDate, 'DD-MM-YYYY').isSame(this.initialActiveSubscription.churnEffectiveDate, 'day'))
          || !this.initialActiveSubscription.churnEffectiveDate
      ) {
        churnSubHasChanges = true;
      }

      // New subscription's status or price
      for (const subscription of garageSubscriptionTypes.values()) {
        if (
          this.activeSubscription[subscription].churn.enabled !== this.initialActiveSubscription[subscription].churn.enabled ||
          this.activeSubscription[subscription].churn.delta !== this.initialActiveSubscription[subscription].churn.delta) {
          churnSubHasChanges = true;
        }
      }

      return churnSubHasChanges ? !this.churnEffectiveDateIsValid(false) : false;
    },
    hasAccessToGreybo() {
      return this.$store.getters['auth/hasAccessToGreybo'];
    },
    isParentTicketsConfigurationWellFilled() {
      if(this.garage?.parent?.shareLeadTicket?.enabled) {
        return Boolean(this.parentGarage?.ticketsConfiguration?.Lead_NewVehicleSale) &&
        Boolean(this.parentGarage?.ticketsConfiguration?.Lead_UsedVehicleSale)
      }
      return true
    },
    isAllowedToLaunch() {
      return this.garage.status === this.GarageStatus.READY && this.activeSubscription.priceValidated && this.isParentTicketsConfigurationWellFilled;
    }
  },
  async mounted() {
    this.loadActiveSub();
    this.updateChanges();
    this.users = await this.getGarageUsers(this.garage.id);
    await this.getParentGarage()
  },
  methods: {
    
    updateChanges() {
      this.subHasChanges = false;
      this.initialActiveSubscription = _.cloneDeep(this.activeSubscription);
      for (const subscription of garageSubscriptionTypes.values()) {
        this.churn[subscription] = this.initialActiveSubscription[subscription].price + this.initialActiveSubscription[subscription].churn.delta;
      }
    },
    churnEffectiveDateIsValid(isDateUpdated) {
      if (isDateUpdated){
        // Remove date => reset churn properties
        if (!this.activeSubscription.churnEffectiveDate) {
          this.handleFullChurnChange(false);
          return true;
        }
        // Add date => initialize churn properties
        else if (!this.initialActiveSubscription.churnEffectiveDate) {
          this.loadChurn(this.garage.subscriptions, true);
        }
      }

      // The date should be after today
      const selectedDate = new Date(this.activeSubscription.churnEffectiveDate);
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(0,0,0,0);
      return selectedDate.getTime() >= tomorrowDate.getTime();
    },
    makeChurnKey(subscriptionName) {
      return `churn_${subscriptionName}`;
    },
    getAnnexGarage() {
      return this.garage.annexGarageId && this.garages.find((garage) => garage.id === this.garage.annexGarageId);
    },
    async getGarageUsers(garageId) {
      const resp = await buildQuery(
        'getGarageUsers',
        { garageId },
        {
          id: String,
          email: String,
          firstName: String,
          lastName: String,
          job: String,
        }
      );
      return (resp.data && resp.data.getGarageUsers) || [];
    },
    toggleMobile() {
      this.activeSubscription.CrossLeads.restrictMobile = !this.activeSubscription.CrossLeads.restrictMobile;
    },
    pricesNotAllFilledError() {
      const sub = this.activeSubscription;
      if (sub.setup.price === "") sub.setup.price = 0;
      if (sub.setup.enabled && !(parseInt(sub.setup.price) === 0 || sub.setup.price > 0)) {
        return 'Setup';
      }
      if (!(parseInt(sub.users.price) === 0 || sub.users.price > 0)) {
        return 'Users';
      }
      if (!(parseInt(sub.contacts.price) === 0 || sub.contacts.price > 0)) {
        return 'Contacts';
      }
      for (const subscription of garageSubscriptionTypes.values()) {
        if (sub[subscription].price === "") sub[subscription].price = 0;
        if (sub[subscription].enabled && !(parseInt(sub[subscription].price) === 0 || sub[subscription].price > 0)) {
          return subscription;
        }
      }
      return null;
    },
    async assignedUser(garageId, userId, oldUserId, alertType) {
      await this.action_updateGarageTicketsConfig({
        garageId,
        userId,
        oldUserId,
        alertType,
      });
    },
    async launchGarage() {
      try {
        this.$store.dispatch(
          'openModal',
          {
            component: 'ModalMatchAutoAssignedUsers',
            props: {
              garage: this.garage,
              action_updateGarageStatus: this.action_updateGarageStatus,
              assignedUser: this.assignedUser,
              users: this.users,
            },
          },
          { root: true }
        );
      } catch (err) {
        this.$snotify.error(`Impossible de lancer le garage. : ${err}`, 'Erreur');
      }
    },
    configureAutoAssignedUsers() {
      try {
        this.$store.dispatch(
          'openModal',
          {
            component: 'ModalMatchAutoAssignedUsers',
            props: { garage: this.garage, assignedUser: this.assignedUser, users: this.users },
          },
          { root: true }
        );
      } catch (err) {
        this.$snotify.error(`Impossible de configurer les managers par défaut. : ${err}`, 'Erreur');
      }
    },
    getBlankSubscription() {
      let sub = {
        priceValidated: false,
        active: false,
        dateStart: null,
        dateEnd: null,
        isFullChurn: false,
        churnEffectiveDate: null,
        setup: {
          enabled: false,
          price: 0,
          monthOffset: 0,
          billDate: null,
          alreadyBilled: false,
        },
        users: {
          included: 0,
          price: 0,
          maximumTotalPriceForUsers: DEFAULT_MAX_TOTAL_PRICE_FOR_USERS,
        },
        contacts: {
          bundle: false,
          included: 0,
          every: 0,
          price: 0,
        },
      };
      for (const subscription of garageSubscriptionTypes.values()) {
        sub[subscription] = {
          enabled: true,
          price: 1,
          date: null,
          churn: {
            enabled: false,
            delta: 0
          }
        };
        if (subscription === 'Automation') {
          sub[subscription].every = 0;
          sub[subscription].included = 0;
        } else if (subscription === 'CrossLeads') {
          sub[subscription].unitPrice = 0;
          sub[subscription].included = 0;
          sub[subscription].restrictMobile = false;
          sub[subscription].minutePrice = 0.15; // default price
        }
      }
      sub.AutomationApv = { enabled: false };
      sub.AutomationVn = { enabled: false };
      sub.AutomationVo = { enabled: false };
      return sub;
    },
    loadChurn(subscriptions, forceReset = false) {
      for (const subscription of garageSubscriptionTypes.values()) {
        const shouldGetChurn = subscriptions[subscription] && subscriptions[subscription].churn && !forceReset;
        this.activeSubscription[subscription].churn.enabled = shouldGetChurn ? subscriptions[subscription].churn.enabled : this.activeSubscription[subscription].enabled;
        this.activeSubscription[subscription].churn.delta = (shouldGetChurn && subscriptions[subscription].churn.delta) || 0;
        this.churn[subscription] = (shouldGetChurn ? this.initialActiveSubscription[subscription].churn.delta : 0) + this.initialActiveSubscription[subscription].price;
      }
    },
    loadActiveSub() {
      const sub = this.garage.subscriptions;
      this.activeSubscription.priceValidated = sub.priceValidated || false;
      this.activeSubscription.active = !!sub.active;
      this.activeSubscription.dateStart = parseInt(sub.dateStart);
      this.activeSubscription.dateEnd = sub.dateEnd;
      this.activeSubscription.isFullChurn = sub.isFullChurn || false;
      this.activeSubscription.churnEffectiveDate = sub.churnEffectiveDate ? new Date(sub.churnEffectiveDate) : null;
      // Setup
      this.activeSubscription.setup.enabled = sub.setup && sub.setup.enabled;
      this.activeSubscription.setup.price = (sub.setup && sub.setup.price) || 0;
      this.activeSubscription.setup.monthOffset = (sub.setup && parseInt(sub.setup.monthOffset)) || 0;
      this.activeSubscription.setup.billDate = sub.setup && sub.setup.billDate;
      this.activeSubscription.setup.alreadyBilled = (sub.setup && sub.setup.alreadyBilled) || false;
      // Users
      this.activeSubscription.users.included = (sub.users && sub.users.included) || 0;
      this.activeSubscription.users.price = (sub.users && sub.users.price) || 0;
      this.activeSubscription.users.maximumTotalPriceForUsers =
        (sub.users && sub.users.maximumTotalPriceForUsers) || DEFAULT_MAX_TOTAL_PRICE_FOR_USERS;
      // Contacts
      this.activeSubscription.contacts.bundle = sub.contacts && sub.contacts.bundle;
      this.activeSubscription.contacts.included = (sub.contacts && sub.contacts.included) || 0;
      this.activeSubscription.contacts.price = (sub.contacts && sub.contacts.price) || 0;
      // Annex
      this.annexEnabled = !!this.garage.annexGarageId;
      // Subscriptions
      for (const subscription of garageSubscriptionTypes.values()) {
        this.activeSubscription[subscription].enabled = (sub[subscription] && sub[subscription].enabled) || false;
        this.activeSubscription[subscription].price = (sub[subscription] && sub[subscription].price) || 0;
        this.activeSubscription[subscription].date = (sub[subscription] && sub[subscription].date) || null;
        this.loadChurn(sub);
      }
      // Automation
      if (!this.activeSubscription.Automation) this.activeSubscription.Automation = {};
      this.activeSubscription.Automation.included = (sub.Automation && sub.Automation.included) || 0;
      this.activeSubscription.Automation.every = (sub.Automation && sub.Automation.every) || 0;
      // XLeads
      if (!this.activeSubscription.CrossLeads) this.activeSubscription.CrossLeads = {};
      this.activeSubscription.CrossLeads.included = (sub.CrossLeads && sub.CrossLeads.included) || 0;
      this.activeSubscription.CrossLeads.unitPrice = (sub.CrossLeads && sub.CrossLeads.unitPrice) || 0;
      this.activeSubscription.CrossLeads.restrictMobile = (sub.CrossLeads && sub.CrossLeads.restrictMobile) || false;
      this.activeSubscription.CrossLeads.minutePrice = (sub.CrossLeads && sub.CrossLeads.minutePrice) || 0;
      this.activeSubscription.AutomationApv = { enabled: !!(sub.AutomationApv && sub.AutomationApv.enabled) };
      this.activeSubscription.AutomationVn = { enabled: !!(sub.AutomationVn && sub.AutomationVn.enabled) };
      this.activeSubscription.AutomationVo = { enabled: !!(sub.AutomationVo && sub.AutomationVo.enabled) };
    },
    loadSubScenario() {
      const scenario = this.subScenarios[this.selectedSubScenario];
      this.activeSubscription.isFullChurn = scenario.isFullChurn || false;
      this.activeSubscription.churnEffectiveDate = scenario.churnEffectiveDate ? new Date(scenario.churnEffectiveDate) :  null;
      // Setup
      this.activeSubscription.setup.enabled = scenario.setup && scenario.setup.enabled;
      this.activeSubscription.setup.price = (scenario.setup && scenario.setup.price) || 0;
      this.activeSubscription.setup.monthOffset = (scenario.setup && parseInt(scenario.setup.monthOffset)) || 0;
      this.activeSubscription.setup.billDate = scenario.setup && scenario.setup.billDate;
      this.activeSubscription.setup.alreadyBilled = scenario.setup && scenario.setup.alreadyBilled;
      this.calcSetupBillDate();
      // Users
      this.activeSubscription.users.included = (scenario.users && scenario.users.included) || 0;
      this.activeSubscription.users.price = (scenario.users && scenario.users.price) || 0;
      this.activeSubscription.users.maximumTotalPriceForUsers =
        (scenario.users && scenario.users.maximumTotalPriceForUsers) || DEFAULT_MAX_TOTAL_PRICE_FOR_USERS;
      // Contacts
      this.activeSubscription.contacts.bundle = scenario.contacts && scenario.contacts.bundle;
      this.activeSubscription.contacts.included = (scenario.contacts && scenario.contacts.included) || 0;
      this.activeSubscription.contacts.price = (scenario.contacts && scenario.contacts.price) || 0;
      // Subscriptions
      for (const subscription of garageSubscriptionTypes.values()) {
        this.activeSubscription[subscription].enabled = scenario[subscription] && scenario[subscription].enabled;
        this.activeSubscription[subscription].price = scenario[subscription] && scenario[subscription].price;
        this.activeSubscription[subscription].date = scenario[subscription] && scenario[subscription].date;
        this.loadChurn(scenario);
      }
      // Automation
      this.activeSubscription.Automation.included = (scenario.Automation && scenario.Automation.included) || 0;
      this.activeSubscription.Automation.every = (scenario.Automation && scenario.Automation.every) || 0;
      // XLeads
      this.activeSubscription.CrossLeads.included = (scenario.CrossLeads && scenario.CrossLeads.included) || 0;
      this.activeSubscription.CrossLeads.unitPrice = (scenario.CrossLeads && scenario.CrossLeads.unitPrice) || 0;
      this.activeSubscription.CrossLeads.restrictMobile =
        (scenario.CrossLeads && scenario.CrossLeads.restrictMobile) || false;
      this.activeSubscription.CrossLeads.minutePrice = (scenario.CrossLeads && scenario.CrossLeads.minutePrice) || 0;
      // Price validation
      this.activeSubscription.priceValidated = scenario.priceValidated || false;
      // Mirror
      if (scenario.mirror) {
        this.annexEnabled = true;
      }
    },
    resetActiveSubscription() {
      this.activeSubscription.active = false;
      this.activeSubscription.dateEnd = new Date();
      for (const subscription of garageSubscriptionTypes.values()) {
        this.activeSubscription[subscription].enabled = false;
      }
    },
    calcSetupBillDate() {
      if (!this.activeSubscription.dateStart) {
        this.activeSubscription.setup.billDate = null;
      } else {
        const timestamp = isNaN(parseInt(this.activeSubscription.dateStart * 1))
          ? this.activeSubscription.dateStart
          : parseInt(this.activeSubscription.dateStart);
        const dateStart = this.$moment(timestamp);
        const billDate = dateStart
          .clone()
          .add(this.activeSubscription.setup.monthOffset - 1, 'month')
          .date(this.billingAccount.billingDate);
        const billMonth = (parseInt(dateStart.month()) + parseInt(this.activeSubscription.setup.monthOffset - 1)) % 12;

        if (parseInt(billDate.month()) !== parseInt(billMonth)) {
          billDate.subtract(1, 'month').endOf('month').hour(20);
        }
        this.activeSubscription.setup.billDate = billDate.toISOString();
      }
    },
    customLabel(option) {
      return `${option.publicDisplayName} - ${option.id}`;
    },
    customLabelWithPrice(option) {
      return `${option.publicDisplayName} - ${option.id} - ${option.price}`;
    },
    async createSubscription() {
      const billingAccountId = this.billingAccount.id;
      const garageId = this.garage.id;
      const subscriptions = this.activeSubscription;

      // the billing controller actully save the annexGarageId on the garage not on the subscriptions
      subscriptions.annexGarageId = this.annexEnabled ? this.selectedAnnexGarage.id : null;

      if (this.pricesNotAllFilledError()) {
        this.$snotify.error(`Le prix n'est pas renseigné : ${this.pricesNotAllFilledError()}`, 'Erreur');
        return;
      }
      if (this.canCreateSubscription() && confirm('Êtes-vous sûr de vouloir créer cet abonnement ?')) {
        try {
          await this.action_createGarageSubscriptions(garageId, billingAccountId, subscriptions);
          this.loadActiveSub();
          this.updateChanges();
          this.$snotify.success(`L'abonnement a été créé avec succès`, 'Abonnement créé');
        } catch (err) {
          this.$snotify.error(`Impossible de créer l'abonnement : ${err}`, 'Erreur');
        }
      }
    },
    async updateSubscription() {
      const billingAccountId = this.billingAccount.id;
      const garageId = this.garage.id;
      const subscriptions = this.activeSubscription;

      // the billing controller actully save the annexGarageId on the garage not on the subscriptions
      subscriptions.annexGarageId = this.annexEnabled ? this.selectedAnnexGarage.id : null;

      if (this.pricesNotAllFilledError()) {
        this.$snotify.error(`Le prix n'est pas renseigné : ${this.pricesNotAllFilledError()}`, 'Erreur');
        return;
      }

      try {
        await this.action_updateGarageSubscriptions(garageId, billingAccountId, subscriptions);
        this.updateChanges();
        this.$snotify.success(`L'abonnement a été mis à jour avec succès`, 'Abonnement mis à jour');
      } catch (err) {
        this.$snotify.error(err, 'Erreur', { timeout: 12000 });
      }
    },
    async terminateSubscription() {
      const billingAccountId = this.billingAccount.id;
      const garageId = this.garage.id;

      if (confirm('Résilier dès maintenant cet abonnement ?')) {
        try {
          await this.action_stopGarageSubscriptions(garageId, billingAccountId);
          this.resetActiveSubscription();
          this.$snotify.success(`L'abonnement a été résilié avec succès`, 'Abonnement résilié');
          this.$store.dispatch('sendSlackMessage', {
            message: `Abonnement resilié : ${this.garage.publicDisplayName}`,
            channel: 'channel_of_death',
          });
        } catch (err) {
          this.$snotify.error(`Impossible de résilier l'abonnement : ${err}`, 'Erreur');
        }
      }
    },
    displayStatus(status) {
      return GarageStatus.displayName(status);
    },
    canCreateSubscription() {
      return !!this.activeSubscription.dateStart;
    },
    isCrossLeadsSourcedEnabled(source) {
      return source === 'CrossLeads' && this.garage.crossLeadsSourcesEnabled;
    },
    notifyIsCrossLeadsSourcedEnabled() {
      this.$snotify.error('Impossible, il y a au moins un traceur actif sur le garage!');
    },
    goToBillingAccount() {
      this.$router.push({
        name: 'grey-bo-automatic-billing-billing-account-billingAccountId',
        params: { billingAccountId: this.billingAccount.id },
      });
    },
    prettifyDateTime: function (date) {
      return this.$moment(date).format('dddd D MMMM YYYY HH:mm:ss');
    },
    prettifyDate: function (date) {
      if (isNaN(parseInt(date * 1))) {
        // date with this format: 019-10-29T22:00:00.000Z
        return this.$moment(date).format('dddd D MMMM YYYY');
      }
      return this.$moment(parseInt(date)).format('dddd D MMMM YYYY');
    },
    toggleActiveSubscriptionField(field) {
      this.activeSubscription[field].enabled = !this.activeSubscription[field].enabled;

      // Subscription update => update the churn's associated properties
      if (garageSubscriptionTypes.values().includes(field)) {
        this.toggleActiveSubscriptionChurnField(field, this.activeSubscription[field].enabled);
      };
    },
    toggleActiveSubscriptionPriceField(field) {
      this.initialActiveSubscription[field].price = this.activeSubscription[field].price;
      this.toggleActiveSubscriptionChurnField(field, this.activeSubscription[field].churn.enabled);
    },
    handleFullChurnChange(value) {
      this.activeSubscription.isFullChurn = value;
      const isChurn = !!this.activeSubscription.churnEffectiveDate;
      for (const subscription of garageSubscriptionTypes.values()) {
        let enableChurn = false;
        if (isChurn && !this.activeSubscription.isFullChurn) {
          enableChurn = this.initialActiveSubscription[subscription].churn.enabled;
          this.activeSubscription[subscription].churn.delta = 0;
        }

        this.toggleActiveSubscriptionChurnField(subscription, enableChurn);
      }
    },
    toggleActiveSubscriptionChurnField(field, value) {
      this.activeSubscription[field].churn.enabled = value;

      this.setIsFullChurn(field);
      this.updateChurnPrice(field);
      this.updateDelta(field);
    },
    setIsFullChurn(field) {
      if (this.activeSubscription[field].churn.enabled) {
        if (this.activeSubscription.isFullChurn) {
          this.activeSubscription.isFullChurn = false;
        }
        // Reset delta
        this.activeSubscription[field].churn.delta = 0;
      } else {
        for (const subscription of garageSubscriptionTypes.values()) {
          if (this.activeSubscription[subscription].churn.enabled) return;
        }
        // All churn are disabled
        this.activeSubscription.isFullChurn = true;
      }
    },
    // Compute the churn price -> difference between the subcription price and the delta (if churn enable)
    updateChurnPrice(field) {
      this.churn[field] = this.initialActiveSubscription[field].price;
      const isChurn = !!this.activeSubscription.churnEffectiveDate;
      if (isChurn && this.activeSubscription[field].churn.enabled) {
        this.churn[field] += this.activeSubscription[field].churn.delta;
      }
    },
     // Compute the delta -> difference between the current churn price (if churn enable) and the subcription price
    updateDelta(field) {
      const isChurn = !!this.activeSubscription.churnEffectiveDate;
      const churnPrice = !isChurn || this.activeSubscription[field].churn.enabled ? this.churn[field] : 0;
      this.activeSubscription[field].churn.delta = parseFloat(parseFloat(churnPrice - this.activeSubscription[field].price).toFixed(2));
    },
    disabledEffectiveDate(date) {
      return this.$moment(date, 'DD-MM-YYYY').isBefore(this.$moment().endOf('day'))
    },
    async getParentGarage() {
      if(!this.garage.parent.garageId) {
        return
      }
      this.parentGarage = await this.action_fetchGarage(this.garage.parent.garageId) || {}
    }
  },
};
</script>

<style lang="scss" scoped>
.cross-leads {
  display: inline-block;
  margin-left: 1rem;
}
.cross-leads-allow-mobile {
  display: inline-block;
  margin: 0.5rem 0 0.5rem 19.5rem;
}
#garage-details-page-wrapper {
  max-width: 1200px;
  margin: auto;
  .garage-details {
    background: #ffffff;
    padding: 15px 20px;
    width: 100%;
    height: 100%;
    border-radius: 3px;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);

    .garage-details-information {
      padding: 0 0 10px 0;
    }
    h3 {
      margin: 0 0 10px 0;
      text-align: center;
      font-size: 1.5rem;
      font-weight: 900;
    }
    .garage-details-info {
      margin: 5px 0;
    }
    .garage-details-info-question {
      font-size: 13px;
      color: #333333;
    }
    .garage-details-info-answer {
      font-size: 12px;
      font-style: italic;
      color: #209ab5;
      display: inline-block;
      padding: 0 5px;
    }
    .garage-details-info-answer.garage-details-info-answer-with-problem {
      color: #c62b1b;
    }
    .garage-details-info-answer.click-answer:hover {
      font-weight: 700;
      cursor: pointer;
    }
    .garage-legacy {
      padding: 0 0 0 20px;
      h6 {
        text-align: center;
        position: absolute;
        top: 46px;
        left: -42px;
        -ms-transform: rotate(-90deg);
        transform: rotate(-90deg);
        color: #bbb;
        font-weight: 300;
        font-style: italic;
      }
    }
    .garages-details-actions {
      padding: 10px 0 0 0;
      border-top: 1px dotted #ccc;
    }
  }
  .garage-active-subscription-wrapper {
    background: #ffffff;
    padding: 15px 20px;
    width: 100%;
    height: 100%;
    border-radius: 3px;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    margin: 1rem 0 0 0;
    .garage-active-subscription-create {
      h5 {
        text-align: left;
        font-size: 1.5rem;
        font-weight: 700;
      }
      form {
        .subscription-field {
          min-height: 35px;
          padding: 1rem;
          background: $bg-grey;
          border-radius: 3px;
          .date-start-error {
            border-color: red;
          }
          .field-subtitle {
            color: $dark-grey;
            font-style: italic;
            font-size: 0.92rem;
          }
          .field-icon {
            color: $dark-grey;
            font-style: italic;
            font-size: 1rem;
            margin-right: 0.3rem;
            position: relative;
            top: 1px;
          }
          .field-title {
            display: inline-block;
            height: 100%;
            width: 260px;
            padding: 6px 0;
            margin-right: 10px;
            font-size: 1rem;
            font-weight: 700;
            color: $dark-grey;
            margin-right: 10px;
            .gs-switch-button {
              float: right;
              margin-top: 3px;
            }
          }
          label {
            font-weight: normal;
            font-style: italic;
            color: #555555;
          }
          &.auto-fill {
            padding-bottom: 1rem;
            height: 45px;
            margin-bottom: 1rem;
          }
          &.annex {
            height: auto;
            .has-annex {
              display: inline-block;
            }
          }
          select {
            width: 215px;
            position: relative;
            top: -0.5rem;
          }
          input {
            width: 80px;
          }
          .input-group-datepicker {
            width: 160px !important;
          }
          .input-group-addon {
            width: 78px;
          }
          .input-group-addon-invisible {
            background-color: unset;
            border: unset;
          }
          .gs-garages-list-wrapper {
            display: inline-block;
            width: 350px;
            margin: 0;
            .gs-garages-list-label-above-input {
              display: none;
            }
            .gs-garages-list-advanced-onoff {
              display: none;
            }
            .gs-garages-list-garages {
              margin: 0;

              input {
                width: 350px;
              }
            }
          }
        }
        .garage-active-subscription-create-action {
          border-top: 1px dotted #cccccc;
          margin-top: 10px;
          padding: 10px 0 0 0;
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
  .garage-unactive-subscriptions-wrapper {
    background: #ffffff;
    padding: 15px 20px;
    width: 100%;
    height: 100%;
    border-radius: 2px;
    box-shadow: 0 0 3px #888;
    margin: 10px 0 0 0;
    h5 {
      text-align: left;
      font-size: 1.5rem;
      font-weight: 900;
    }
    table {
      width: 100%;
      th {
        font-weight: 400;
        font-size: 14px;
        color: #666666;
      }
      td {
        font-size: 11px;
        color: #333333;
        padding-top: 2px;
      }
    }
  }
}
.garage-details-page-wrapper {
  &__header {
    display: flex;
    margin: 2rem 0 0 0;
    background: $bg-grey;
    align-items: center;
    padding-left: 1rem;
    border-radius: 3px;
  }
  &__logo {
    width: 2.5rem;
    margin-right: 0.5rem;
    position: relative;
    top: 5px;
  }
}
</style>
