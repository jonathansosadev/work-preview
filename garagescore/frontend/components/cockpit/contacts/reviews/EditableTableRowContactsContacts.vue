<template>
  <TableRow>
    <div class="row-customer" :style="{ flex: 7 }">
      <div class="row-customer__content" v-if="editable">
        <CardGrey class="row-customer__part">
          <template slot="title">
            {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('ClientProcess') }}
          </template>
          <div class="row-customer__info" style="padding-bottom: 0">
            <div class="row-customer__sub-title">
              <i class="icon-gs-like pre-icon"></i>
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Score') }}
            </div>
          </div>
          <div class="row-customer__info" style="margin-top: 0; margin-left: 2rem;">
            <AppText
              tag="div"
              type="muted"
              italic
            >
              ({{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('note') }})
            </AppText>
          </div>
          <div class="row-customer__info">
            <i
              v-if="ticket.score === 0 || ticket.score"
              :class="icon"
              class="level"
            />
            <Multiselect
              class="score"
              :placeholder="'*' + $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('TheScore')"
              :options="optionsScore.map((e) => e.value)"
              v-model="ticket.score"
              :custom-label="(e) => getLabel(optionsScore, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsScore, option) }}</strong>
              </template>
            </Multiselect>
            <Multiselect
              v-if="unsatisfied"
              class="unsatisfiedCriteria"
              :placeholder="'*' + $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Criteria')"
              :options="optionsUnsatisfiedCriteria.map((e) => e.value)"
              :limit-text="andMore"
              v-model="ticket.unsatisfiedCriteria"
              :close-on-select="false"
              :limit="1"
              :hide-selected="false"
              :multiple="true"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template
                slot="tag"
                slot-scope="{ option }"
              >
                <strong>{{ getLabel(optionsUnsatisfiedCriteria, option) }}</strong>
              </template>
              <template
                slot="option"
                slot-scope="{ option }"
              >
                {{ getLabel(optionsUnsatisfiedCriteria, option) }}
              </template>
            </Multiselect>
            <span v-else class="unsatisfiedCriteria" />
            <Multiselect
              v-if="unsatisfied && ticket.unsatisfiedCriteria && ticket.unsatisfiedCriteria.length"
              class="basic"
              :options="optionsResolved.map((e) => e.value)"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Resolved?')"
              v-model.number="ticket.resolved"
              :custom-label="(e) => getLabel(optionsResolved, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsResolved, option) }}</strong>
              </template>
            </Multiselect>
            <span v-else class="basic" />
          </div>
          <div class="row-customer__info">
            <textarea
              title="comment"
              :disabled="contactTicketStatusTerminated"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('WriteAComment')"
              class="comment-zone"
              v-model="ticket.comment"
            />
          </div>
        </CardGrey>
        <CardGrey class="row-customer__assignation-part" style="background-color: unset!important;">
          <template slot="title">
            {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Assignation') }}
          </template>
          <div class="row-customer__info" style="margin-top: 57px">
            <Multiselect
              v-if="canAssign"
              class="basic"
              :options="optionsAssigner.map((e) => e.value)"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('AssignTo?')"
              v-model="ticket.assigner"
              :custom-label="(e) => getLabel(optionsAssigner, e)"
              label="text"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsAssigner, option, true) }}</strong>
              </template>
            </Multiselect>
          </div>
        </CardGrey>
      </div>
      <div class="row-customer__content" v-if="canCreateLead && editable">
        <CardGrey class="row-customer__part">
          <div class="row-customer__info">
            <div class="row-customer__sub-title">
              <i class="icon-gs-car-repair pre-icon"></i>
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('LeadIntention') }}
            </div>
          </div>
          <div class="row-customer__info">
            <Multiselect
              class="basic"
              :options="optionsLeadType.map((e) => e.value)"
              :placeholder="'*' + $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Lead?')"
              v-model="ticket.leadType"
              :custom-label="(e) => getLabel(optionsLeadType, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
              @input="resetLeadAssigner"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsLeadType, option) }}</strong>
              </template>
            </Multiselect>
            <Multiselect
              v-if="ticket.leadType && newLead"
              class="basic"
              :options="optionLeadToCreate.map((e) => e.value)"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('CreateNewLead?')"
              v-model.number="ticket.leadToCreate"
              :custom-label="(e) => getLabel(optionLeadToCreate, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionLeadToCreate, option) }}</strong>
              </template>
            </Multiselect>
            <span v-else class="basic" />
          </div>
          <div class="row-customer__info" v-if="showLeadDetail">
            <Multiselect
              class="basic"
              :options="optionsLeadTiming.map((e) => e.value)"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('timing?')"
              v-model="ticket.leadTiming"
              :custom-label="(e) => getLabel(optionsLeadTiming, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsLeadTiming, option) }}</strong>
              </template>
            </Multiselect>
            <Multiselect
              class="basic"
              :options="optionsLeadSaleType.map((e) => e.value)"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('saleType?')"
              v-model="ticket.leadSaleType"
              :custom-label="(e) => getLabel(optionsLeadSaleType, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsLeadSaleType, option) }}</strong>
              </template>
            </Multiselect>
            <InputBasic
              class="input-field"
              :disabled="contactTicketStatusTerminated"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('brandModel?')"
              size="xl"
              v-model="ticket.leadBrandModel"
            />
          </div>
          <div class="row-customer__info" v-if="showLeadDetail">
            <Multiselect
              class="multiselector"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('bodyType?')"
              :options="optionsLeadBodyType.map((e) => e.value)"
              :limit-text="andMore"
              v-model="ticket.leadBodyType"
              @input="unSelect(ticket.leadBodyType)"
              :close-on-select="false"
              :limit="1"
              :hide-selected="false"
              :multiple="true"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template
                slot="tag"
                slot-scope="{ option }"
              >
                <strong>{{ getLabel(optionsLeadBodyType, option) }}</strong>
              </template>
              <template
                slot="option"
                slot-scope="{ option }"
              >
                {{ getLabel(optionsLeadBodyType, option) }}
              </template>
            </Multiselect>
            <Multiselect
              v-if="!motorbike"
              class="multiselector"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('energy?')"
              :options="optionsLeadEnergy.map((e) => e.value)"
              :limit-text="andMore"
              v-model="ticket.leadEnergy"
              :close-on-select="false"
              :limit="1"
              :hide-selected="false"
              :multiple="true"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
              @input="unSelect(ticket.leadEnergy)"
            >
              <template
                slot="tag"
                slot-scope="{ option }"
              >
                <strong>{{ getLabel(optionsLeadEnergy, option) }}</strong>
              </template>
              <template
                slot="option"
                slot-scope="{ option }"
              >
                {{ getLabel(optionsLeadEnergy, option) }}
              </template>
            </Multiselect>
            <Multiselect
              v-else
              class="multiselector"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('cylinder?')"
              :options="optionsLeadCylinder.map((e) => e.value)"
              :limit-text="andMore"
              v-model="ticket.leadCylinder"
              :close-on-select="false"
              :limit="1"
              :hide-selected="false"
              :multiple="true"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
              @input="unSelect(ticket.leadCylinder)"
            >
              <template
                slot="tag"
                slot-scope="{ option }"
              >
                <strong>{{ getLabel(optionsLeadCylinder, option) }}</strong>
              </template>
              <template
                slot="option"
                slot-scope="{ option }"
              >
                {{ getLabel(optionsLeadCylinder, option) }}
              </template>
            </Multiselect>
            <Multiselect
              class="basic"
              :options="optionsLeadTradeIn.map((e) => e.value)"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('tradeIn?')"
              v-model="ticket.leadTradeIn"
              :custom-label="(e) => getLabel(optionsLeadTradeIn, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsLeadTradeIn, option) }}</strong>
              </template>
            </Multiselect>
          </div>
          <div class="row-customer__info" v-if="showLeadDetail">
            <Multiselect
              class="basic"
              :options="optionsLeadFinancing.map((e) => e.value)"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('financing?')"
              v-model="ticket.leadFinancing"
              :custom-label="(e) => getLabel(optionsLeadFinancing, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsLeadFinancing, option) }}</strong>
              </template>
            </Multiselect>
            <InputBasic
              class="input-field"
              :disabled="contactTicketStatusTerminated"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('budget?')"
              size="xl"
              v-model="ticket.leadBudget"
            />
          </div>
          <div class="row-customer__info" v-if="showLeadDetail">
            <textarea
              title="commentLead"
              :disabled="contactTicketStatusTerminated"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('WriteACommentLead')"
              class="comment-zone"
              v-model="ticket.leadComment"
            />
          </div>
        </CardGrey>
        <CardGrey class="row-customer__assignation-part">
          <div class="row-customer__info" style="margin-top: 37px">
            <Multiselect
              v-if="canTransfer"
              class="basic"
              :options="optionsAssigner.map((e) => e.value)"
              :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('AssignTo?')"
              v-model="ticket.leadAssigner"
              :custom-label="(e) => getLabel(optionsAssigner, e)"
              :select-label="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Choose')"
              deselect-label="╳"
              selectedLabel="✓"
              :disabled="contactTicketStatusTerminated"
            >
              <template slot="singleLabel" slot-scope="{ option }">
                <strong>{{ getLabel(optionsAssigner, option, true) }}</strong>
              </template>
            </Multiselect>
          </div>
        </CardGrey>
      </div>
      <div class="row-customer__content" v-if="editable">
        <CardGrey class="row-customer__part" />
        <CardGrey class="row-customer__assignation-part">
          <div class="row-customer__info">
            <Button
              role="button"
              type="orange"
              @click="closeWithoutTreatment"
              :disabled="canClose || contactTicketStatusTerminated || isClosedWithoutTreatment || cantCreateNewLead || canCloseWithoutTreatment"
              class="row-customer__button-status row-customer__save"
            >
              <div class="row-customer__button-status-content">
                <span class="row-customer__button-status-content-text">{{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('closeWithoutTreatment') }}</span>
              </div>
            </Button>
            <Button
              role="button"
              type="orange"
              @click="save"
              :disabled="!shouldSave || contactTicketStatusTerminated"
              class="row-customer__button-status row-customer__save"
            >
              <div class="row-customer__button-status-content">
                <span class="row-customer__button-status-content-text">{{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Save') }}</span>
              </div>
            </Button>
            <Button
              v-if="ticket.assigner || ticket.leadAssigner"
              role="button"
              :type="closeType"
              @click="close"
              :disabled="!canClose || contactTicketStatusTerminated"
              class="row-customer__button-status"
            >
              <div class="row-customer__button-status-content">
                <span class="row-customer__button-status-content-text">{{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Transfer') }}</span>
              </div>
            </Button>
            <Button
              v-else
              role="button"
              :type="closeType"
              :disabled="!canClose || contactTicketStatusTerminated || !isResolved"
              @click="close"
              class="row-customer__button-status"
            >
              <div class="row-customer__button-status-content">
                <span class="row-customer__button-status-content-text">{{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Validate') }}</span>
              </div>
            </Button>
          </div>
          <div class="row-customer__button-baseline" v-if="showMandatoryFieldsMessage">
            <span class="row-customer__button-baselin__text">{{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('MandatoryFields') }}</span>
          </div>
        </CardGrey>
      </div>
      <div class="row-customer__content">
        <CardGrey class="row-customer__part">
          <template slot="title">
            {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Customer') }}
          </template>
          <div class="row-customer__info">
            <template v-if="currentFieldBeingEdited !== 'title'">
              <AppText
                tag="label"
                class="row-customer__info-label"
                bold
              >
                {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Title') }} :
              </AppText>
              <AppText
                tag="span"
                class="row-customer__info-value"
                :type="getType(fields.title, oldTitle)"
              >
                {{ customerTitle(fields.title) }}
              </AppText>
              <button class="row-customer__edit" @click="edit('title')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null)">
                <AppText
                  lass="card-content__info-label"
                  tag="label"
                  bold
                >
                  {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Title') }} :
                </AppText>
                <SelectBasic
                  size="sm"
                  validateEvent
                  v-model="fields.title"
                  @validate="updateField('title')"
                  :options="optionsTitle"
                />
              </FieldGroup>
            </template>
          </div>
          <div class="row-customer__info">
            <template v-if="currentFieldBeingEdited !== 'fullName'">
              <AppText
                class="row-customer__info-label"
                tag="span"
                bold
              >
                {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Name') }}:
              </AppText>
              <FormattedValueWithMissingHandling
                class="row-customer__info-value"
                :type="getType(fields.fullName, oldFullName)"
                tag="span"
                :value="fields.fullName"
              />
              <button class="row-customer__edit" @click="edit('fullName')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null)">
                <AppText
                  lass="row-customer__info-label"
                  tag="label"
                  bold
                >
                  {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Name') }}:
                </AppText>
                <InputBasic
                  size="sm"
                  validateEvent
                  :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Name')"
                  v-model="fields.fullName"
                  @keyup.enter="updateField('fullName')"
                  @validate="updateField('fullName')"
                >
                  <template slot="right">
                    <i class="icon-gs-validation-check-circle" />
                  </template>
                </InputBasic>
              </FieldGroup>
            </template>
          </div>
          <div class="row-customer__info">
            <template v-if="currentFieldBeingEdited !== 'phone'">
              <AppText
                class="row-customer__info-label"
                tag="span"
                bold
              >
                {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Phone') }}:
              </AppText>
              <AppText
                class="row-customer__info-value"
                :type="getType(fields.phone, oldPhone)"
                tag="span"
              >
                {{ formattedValue(fields.phone, customerPhoneStatus) }}
              </AppText>
              <button class="row-customer__edit" @click="edit('phone')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null)">
                <AppText
                  lass="row-customer__info-label"
                  tag="label"
                  bold
                >
                  {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Phone') }}:
                </AppText>
                <InputBasic
                  size="sm"
                  validateEvent
                  :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Phone')"
                  v-model="fields.phone"
                  @keyup.enter="updateField('phone')"
                  @validate="updateField('phone')"
                >
                  <template slot="right">
                    <i class="icon-gs-validation-check-circle" />
                  </template>
                </InputBasic>
              </FieldGroup>
            </template>
          </div>
          <div class="row-customer__info">
            <template v-if="currentFieldBeingEdited !== 'email'">
              <AppText
                class="row-customer__info-label"
                tag="span"
                bold
              >
                {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Email') }}:
              </AppText>
              <AppText
                class="row-customer__info-value"
                :type="getType(fields.email, oldEmail)"
                tag="span"
              >
                {{ formattedValue(fields.email, customerEmailStatus) }}
              </AppText>
              <button class="row-customer__edit" @click="edit('email')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null)">
                <AppText
                  lass="row-customer__info-label"
                  tag="label"
                  bold
                >
                  {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Email') }}:
                </AppText>
                <InputBasic
                  size="sm"
                  validateEvent
                  :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Email')"
                  v-model="fields.email"
                  @keyup.enter="updateField('email')"
                  @validate="updateField('email')"
                >
                  <template slot="right">
                    <i class="icon-gs-validation-check-circle" />
                  </template>
                </InputBasic>
              </FieldGroup>
            </template>
          </div>
          <div class="row-customer__info">
            <template v-if="currentFieldBeingEdited !== 'street'">
              <AppText
                class="row-customer__info-label"
                tag="span"
                bold
              >
                {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Street') }}:
              </AppText>
              <AppText
                class="row-customer__info-value"
                :type="getType(fields.street, oldStreet)"
                tag="span"
              >
                {{ formattedValue(fields.street) }}
              </AppText>
              <button class="row-customer__edit" @click="edit('street')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null)">
                <AppText
                  lass="row-customer__info-label"
                  tag="label"
                  bold
                >
                  {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Street') }}:
                </AppText>
                <InputBasic
                  size="sm"
                  validateEvent
                  :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Street')"
                  v-model="fields.street"
                  @keyup.enter="updateField('street')"
                  @validate="updateField('street')"
                >
                  <template slot="right">
                    <i class="icon-gs-validation-check-circle" />
                  </template>
                </InputBasic>
              </FieldGroup>
            </template>
          </div>
          <div class="row-customer__info">
            <template v-if="currentFieldBeingEdited !== 'city'">
              <AppText
                class="row-customer__info-label"
                tag="span"
                bold
              >
                {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('City') }}:
              </AppText>
              <AppText
                class="row-customer__info-value"
                :type="getType(fields.city, oldCity)"
                tag="span"
              >
                {{ formattedValue(fields.city) }}
              </AppText>
              <button class="row-customer__edit" @click="edit('city')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null)">
                <AppText
                  lass="row-customer__info-label"
                  tag="label"
                  bold
                >
                  {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('City') }}:
                </AppText>
                <InputBasic
                  size="sm"
                  validateEvent
                  :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('City')"
                  v-model="fields.city"
                  @keyup.enter="updateField('city')"
                  @validate="updateField('city')"
                >
                  <template slot="right">
                    <i class="icon-gs-validation-check-circle" />
                  </template>
                </InputBasic>
              </FieldGroup>
            </template>
          </div>
          <div class="row-customer__info">
            <template v-if="currentFieldBeingEdited !== 'postalCode'">
              <AppText
                class="row-customer__info-label"
                tag="span"
                bold
              >
                {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('PostalCode') }}:
              </AppText>
              <AppText
                class="row-customer__info-value"
                :type="getType(fields.postalCode, oldPostalCode)"
                tag="span"
              >
                {{ formattedValue(fields.postalCode) }}
              </AppText>
              <button class="row-customer__edit" @click="edit('postalCode')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null)">
                <AppText
                  lass="row-customer__info-label"
                  tag="label"
                  bold
                >
                  {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('PostalCode') }}:
                </AppText>
                <InputBasic
                  size="sm"
                  validateEvent
                  :placeholder="$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('PostalCode')"
                  v-model="fields.postalCode"
                  @keyup.enter="updateField('postalCode')"
                  @validate="updateField('postalCode')"
                >
                  <template slot="right">
                    <i class="icon-gs-validation-check-circle" />
                  </template>
                </InputBasic>
              </FieldGroup>
            </template>
          </div>
        </CardGrey>

        <CardGrey class="row-customer__part">
          <template slot="title">
            {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Vehicule') }}
          </template>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Make') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(vehicleBrand) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(vehicleBrand) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Model') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(vehicleModel) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(vehicleModel) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Plaque') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(vehicleImmat) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(vehicleImmat) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Vin') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(vin) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(vin) }}
            </AppText>
            <!-- ICI AJOUTER Les infos -->
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('firstRegisteredAt') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(registrationDate) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(registrationDate) }}
            </AppText>
            <!-- ICI AJOUTER Les infos -->
          </div>
        </CardGrey>

        <CardGrey class="row-customer__part">
          <template slot="title">
            {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Service') }}
          </template>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Garage') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(garageName) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(garageName) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Type') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(type) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue($t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(type)) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Date') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(date) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('atDate', { date: $d(new Date(date), 'cockpit') }) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('FrontDeskUser') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(serviceFrontDeskUserName) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(serviceFrontDeskUserName) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('InternalId') }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(internalId) ? 'muted-light': 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(internalId) }}
            </AppText>
          </div>
        </CardGrey>
      </div>
    </div>
  </TableRow>
</template>
<script>
import CardGrey from '~/components/global/CardGrey.vue';
import ContactTicketStatus from '~/utils/models/data/type/contact-ticket-status.js';
import CylinderTypes from '~/utils/models/data/type/cylinder-types.js';
import DataTypes from '~/utils/models/data/type/data-types.js';
import LeadFinancing from '~/utils/models/data/type/lead-financing.js';
import LeadTimings from '~/utils/models/data/type/lead-timings.js';
import LeadTradeInTypes from '~/utils/models/data/type/lead-trade-in-types.js';
import LeadTypes from '~/utils/models/data/type/lead-types.js';
import bodyTypesByGarageType from '~/utils/models/data/type/vehicle-bodytypes.js';
import LeadEnergies from '~/utils/models/data/type/vehicle-energytypes.js';
import GarageTypes from '~/utils/models/garage.type.js';

export default {
  components: { CardGrey },
  data: function () {
    return {
      currentFieldBeingEdited: null,
      ticket: {
        status: this.contactTicket && this.contactTicket.status,
        score: this.contactTicket && this.contactTicket.score,
        unsatisfiedCriteria:
          this.contactTicket && this.contactTicket.unsatisfiedCriteria,
        resolved: this.contactTicket && this.contactTicket.resolved,
        comment: this.contactTicket && this.contactTicket.comment,
        assigner: this.contactTicket && this.contactTicket.assigner,

        leadAssigner: this.contactTicket && this.contactTicket.leadAssigner,
        leadComment: this.contactTicket && this.contactTicket.leadComment,

        leadType: this.contactTicket && this.contactTicket.leadType,
        leadTiming: this.contactTicket && this.contactTicket.leadTiming,
        leadBodyType: this.contactTicket && this.contactTicket.leadBodyType,
        leadEnergy: this.contactTicket && this.contactTicket.leadEnergy,
        leadCylinder: this.contactTicket && this.contactTicket.leadCylinder,
        leadFinancing: this.contactTicket && this.contactTicket.leadFinancing,
        leadSaleType: this.contactTicket && this.contactTicket.leadSaleType,
        leadBudget: this.contactTicket && this.contactTicket.leadBudget,
        leadTradeIn: this.contactTicket && this.contactTicket.leadTradeIn,
        leadBrandModel: this.contactTicket && this.contactTicket.leadBrandModel,
        leadToCreate: this.contactTicket && this.castToInt(this.contactTicket.leadToCreate),
      },
      fields: {
        title: this.title,
        fullName: this.fullName,
        phone: this.phone,
        email: this.email,
        street: this.street,
        city: this.city,
        postalCode: this.postalCode,
      },
    };
  },

  props: {
    id: String,

    contactTicket: Object,
    garageSubscriptions: Object,
    surveyRespondedAt: String,

    title: String,
    fullName: String,
    phone: String,
    email: String,
    street: String,
    city: String,
    postalCode: String,

    users: Array,

    //---------
    oldTitle: String,
    oldFullName: String,
    oldPhone: String,
    oldEmail: String,
    oldStreet: String,
    oldCity: String,
    oldPostalCode: String,
    //-----------

    internalId: String,
    vehicleBrand: String,
    vehicleModel: String,
    vehicleImmat: String,
    vin: String,
    registrationDate: String,
    date: String,
    manager: String,
    garageName: String,
    garageType: String,
    type: String,
    customerCampaignContactStatus: String,
    explainCampaignContactStatus: String,
    customerEmailStatus: String,
    customerPhoneStatus: String,
    explainEmailStatus: String,
    explainPhoneStatus: String,
    isCampaignContactedByEmail: Boolean,
    isCampaignContactedByPhone: Boolean,
    campaignFirstSendAt: String,
    serviceFrontDeskUserName: String,

    getNotPossibleStatus: { type: Function, required: true },
    updateContactsListData: { type: Function, required: true },
    changeRowSubview: { type: Function, required: true },
    updateData: { type: Function, required: true },
    saveTicket: { type: Function, required: true },
  },
  async mounted() {},
  computed: {
    editable() {
      return !this.getNotPossibleStatus({
        surveyRespondedAt: this.surveyRespondedAt,
        contactTicketStatus: this.contactTicket?.status,
        customerCampaignContactStatus: this.customerCampaignContactStatus,
        customerPhoneStatus: this.customerPhoneStatus,
        campaignFirstSendAt: this.campaignFirstSendAt,
      });
    },
    motorbike() {
      return this.garageType === GarageTypes.MOTORBIKE_DEALERSHIP;
    },
    contactTicketStatusTerminated() {
      return this.ticket.status === ContactTicketStatus.TERMINATED;
    },
    canCreateLead() {
      return (
        this.garageSubscriptions.Lead &&
        [DataTypes.MAINTENANCE, DataTypes.VEHICLE_INSPECTION].includes(
          this.type,
        )
      );
    },
    lead() {
      return LeadTypes.isLead(this.ticket.leadType);
    },
    unsatisfied() {
      return this.ticket.score <= 6 && this.ticket.score !== null;
    },
    unsatisfiedTicket() {
      return this.unsatisfied && this.ticket.resolved === 0;
    },
    closeType() {
      return 'orange';
    },
    canCloseUnsatisfiedTicket() {
      const ticketResolvedAndExistAssigner = this.ticket.resolved === 1 || this.ticket.assigner;
      return (
        this.ticket.score > 6
        || (ticketResolvedAndExistAssigner && this.ticket.unsatisfiedCriteria?.length)
      );
    },
    isResolved() {
      if (this.ticket.score < 7 && this.unsatisfied && this.ticket.unsatisfiedCriteria?.length) {
        return typeof (this.ticket.resolved) === 'number';
      }
      return this.ticket.score >= 7;
    },
    canCloseLead() {
      return !!(
        (this.ticket.leadType && this.isRequiredLeadFieldsFilled) ||
        !this.canCreateLead
      );
    },
    isRequiredLeadFieldsFilled() {
      if (this.ticket.leadAssigner) {
        return true;
      }
      if (this.ticket.leadType === LeadTypes.IN_CONTACT_WITH_VENDOR && this.ticket.leadToCreate === 0) {
        return true;
      }
      return !this.lead;
    },
    canClose() {
      return this.canCloseUnsatisfiedTicket && this.canCloseLead;
    },
    saveType() {
      return this.shouldSave ? 'orange' : 'white';
    },
    shouldSave() {
      return Object.keys(this.ticket).find(k => {
        if (!this.contactTicket) {
          return true;
        }
        if (Array.isArray(this.ticket[k])) {
          return !this.isArrayEqual(this.ticket[k], this.contactTicket[k]);
        }
        return this.ticket[k] !== this.contactTicket[k];
      });
    },
    icon() {
      if (this.ticket.score > 8) {
        return "icon-gs-happy";
      } else if (this.ticket.score < 7) {
        return "icon-gs-sad";
      }
      return "icon-gs-straight";
    },
    optionsTitle() {
      return [
        { value: 'Monsieur', text: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Monsieur') },
        { value: 'Madame', text: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Madame') },
      ];
    },
    optionsAssigner() {
      return this.users.map(u => ({
        value: u.id,
        labelSelected:
          u.firstName || u.lastName ? `${u.firstName} ${u.lastName}` : u.email,
        label:
          (u.firstName || u.lastName
            ? `${u.firstName} ${u.lastName}`
            : u.email) +
          ' - ' +
          this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(u.job.replace(/'/g,''), {}, u.job.replace(/'/g,'')),
      }));
    },
    optionsResolved() {
      return [
        { value: 1, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('No') },
        { value: 0, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Yes') },
      ];
    },
    optionsLeadTiming() {
      return LeadTimings.getValuesWithoutSgsValues().map(k => ({ value: k, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(k) }));
    },
    optionsLeadFinancing() {
      return LeadFinancing.values().map(k => ({ value: k, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(k) }));
    },
    optionsLeadTradeIn() {
      return LeadTradeInTypes.values().map(k => ({ value: k, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(k) }));
    },
    optionsLeadSaleType() {
      return [
        { value: 'NewVehicleSale', label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('NewVehicleSale') },
        { value: 'UsedVehicleSale', label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('UsedVehicleSale') },
        { value: 'Unknown', label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Unknown') },
      ];
    },
    optionsLeadBodyType() {
      const bodyTypesByGarageTypeFiltered = bodyTypesByGarageType.bodyTypesByGarageType(this.garageType);
      return Object.values(bodyTypesByGarageTypeFiltered).map(k => ({ value: k, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(k) }));
    },
    optionsLeadEnergy() {
      return LeadEnergies.getValuesWithoutSgsValues().map(k => ({ value: k, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(k) }));
    },
    optionsLeadCylinder() {
      return Object.values(CylinderTypes.CylinderTypes).map(k => ({ value: k, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(k) }));
    },
    optionsLeadType() {
      return [
        LeadTypes.INTERESTED,
        LeadTypes.IN_CONTACT_WITH_VENDOR,
        LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS,
        LeadTypes.ALREADY_ORDERED,
        LeadTypes.NOT_INTERESTED,
      ].map(k => ({ value: k, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(k) }));
    },
    optionsScore() {
      return [
        { value: 10, label: '10' },
        { value: 9, label: '9' },
        { value: 8, label: '8' },
        { value: 7, label: '7' },
        { value: 6, label: '6' },
        { value: 5, label: '5' },
        { value: 4, label: '4' },
        { value: 3, label: '3' },
        { value: 2, label: '2' },
        { value: 1, label: '1' },
        { value: 0, label: '0' },
      ];
    },
    optionsUnsatisfiedCriteria() {
      let criteria = [];
      if (this.type === DataTypes.MAINTENANCE) {
        criteria = [
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Maintenance1'), value: 'Maintenance1' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Maintenance2'), value: 'Maintenance2' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Maintenance3'), value: 'Maintenance3' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Maintenance4'), value: 'Maintenance4' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Maintenance5'), value: 'Maintenance5' },
        ];
      } else if (this.type === DataTypes.NEW_VEHICLE_SALE) {
        criteria = [
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleNew1'), value: 'SaleNew1' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleNew2'), value: 'SaleNew2' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleNew3'), value: 'SaleNew3' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleNew4'), value: 'SaleNew4' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleNew5'), value: 'SaleNew5' },
        ];
      } else if (this.type === DataTypes.USED_VEHICLE_SALE) {
        criteria = [
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleUsed1'), value: 'SaleUsed1' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleUsed2'), value: 'SaleUsed2' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleUsed3'), value: 'SaleUsed3' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleUsed4'), value: 'SaleUsed4' },
          { label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('SaleUsed5'), value: 'SaleUsed5' },
        ];
      } else if (this.type === DataTypes.VEHICLE_INSPECTION) {
        criteria = [
          {
            label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('VehicleInspectionCriterion_0'),
            value: 'VehicleInspectionCriterion_0',
          },
          {
            label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('VehicleInspectionCriterion_1'),
            value: 'VehicleInspectionCriterion_1',
          },
          {
            label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('VehicleInspectionCriterion_2'),
            value: 'VehicleInspectionCriterion_2',
          },
          {
            label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('VehicleInspectionCriterion_3'),
            value: 'VehicleInspectionCriterion_3',
          },
          {
            label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('VehicleInspectionCriterion_4'),
            value: 'VehicleInspectionCriterion_4',
          },
        ];
      }
      return criteria.sort((a, b) =>
        a.label.replace('É', 'E') < b.label.replace('É', 'E') ? -1 : 1,
      );
    },
    canAssign() {
      return this.unsatisfied
        && this.ticket.unsatisfiedCriteria?.length
        && this.ticket.resolved === 0;
    },
    optionLeadToCreate() {
      return [
        { value: 0, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('No') },
        { value: 1, label: this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Yes') },
      ];
    },
    newLead() {
      return this.ticket.leadType === LeadTypes.IN_CONTACT_WITH_VENDOR;
    },
    canAssignNewLead() {
      return this.ticket.leadType === LeadTypes.IN_CONTACT_WITH_VENDOR && this.ticket.leadToCreate === 1;
    },
    isClosedWithoutTreatment() {
      return this.ticket.status === ContactTicketStatus.CLOSED_WITHOUT_TREATMENT;
    },
    cantCreateNewLead() {
      return this.newLead && this.ticket.leadToCreate === 0;
    },
    leadTypeIsInteressed() {
      return this.ticket.leadType === LeadTypes.INTERESTED;
    },
    leadTypeIsAlrdyPlanOtherBiz() {
      return this.ticket.leadType === LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS;
    },
    canTransfer() {
      const leadAndcanAssignNewLead = this.lead && this.canAssignNewLead;
      return leadAndcanAssignNewLead
        || this.leadTypeIsInteressed
        || this.leadTypeIsAlrdyPlanOtherBiz;
    },
    showLeadDetail() {
      const leadAndleadTypeIsInteressed = this.lead && (this.leadTypeIsInteressed || this.leadTypeIsAlrdyPlanOtherBiz);
      const leadTypeIsInContactWthVendor = this.ticket.leadType === LeadTypes.IN_CONTACT_WITH_VENDOR;
      const finalConditionOr = this.lead && leadTypeIsInContactWthVendor && this.ticket.leadToCreate === 1;
      return leadAndleadTypeIsInteressed || finalConditionOr;
    },
    showMandatoryFieldsMessage() {
      return !this.canCloseUnsatisfiedTicket || this.ticket.leadType === null;
    },
    canCloseWithoutTreatment() {
      // Can close if no treatment (score or lead) other than comment
      const ticketScoreAndLeadTypeNull = this.ticket.score === null && this.ticket.leadType === null;
      const ticketCommentNullOrEmptyString = this.ticket.comment === null || this.ticket.comment === '';
      return !ticketScoreAndLeadTypeNull || ticketCommentNullOrEmptyString;
    },
  },
  methods: {
    unSelect(model) {
      // Handle "Unknown" response
      if (['unknown', 'Unknown'].includes(model[model.length - 1])) {
        model.splice(0, model.length - 1);
      } else {
        if (model[model.length - 1] && ['unknown', 'Unknown'].includes(model[model.length - 2])) {
          model.shift();
        }
      }
    },
    isArrayEqual(a, a2) {
      if (a && !a2) {
        return false;
      }
      return a.sort().join('') === a2.sort().join('');
    },
    async close() {
      if (
        confirm(
          `${this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('areYouSure', {
            and:
              this.unsatisfiedTicket || this.lead
                ? this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('andCreate')
                : this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('close'),
            end: [
              this.unsatisfiedTicket && this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('unsatisfied'),
              this.lead && this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('lead'),
            ].filter(e => e).join(` ${this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('and')} `),
          })}`,
        )
      ) {
        this.ticket.status = ContactTicketStatus.TERMINATED;
      }
      await this.save();
    },
    async save() {
      this.loading = true;
      if (this.ticket.status !== ContactTicketStatus.TERMINATED
        && this.ticket.status !== ContactTicketStatus.CLOSED_WITHOUT_TREATMENT) {
        this.ticket.status = ContactTicketStatus.ONGOING;
      }

      this.ticket.leadToCreate = this.castToBoolean(this.ticket.leadToCreate);
      this.updateContactsListData({ id: this.id, field: 'contactTicket', value: this.ticket });
      await this.saveTicket({ id: this.id, ...this.ticket });
      this.changeRowSubview({ id: this.id, view: 'contactTicket' });
      this.loading = false;
    },
    async closeWithoutTreatment() {
      if (confirm(`${this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('areYouSure', {
        and:
          this.unsatisfiedTicket || this.lead
            ? this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('andCreate')
            : this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('close'),
        end: [
          this.unsatisfiedTicket && this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('unsatisfied'),
          this.lead && this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('lead'),
        ].filter(e => e).join(` ${this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('and')} `),
      })}`)
      ) {
        this.ticket.status = ContactTicketStatus.CLOSED_WITHOUT_TREATMENT;
        this.ticket.comment = this.ticket.comment || this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('closeWithoutTreatment');
        await this.save();
      }
    },
    andMore(count) {
      return `+ ${count}`;
    },
    getLabel(options, value, selected) {
      const option = options.find(e => e.value === value);
      if (!option) {
        return null;
      }
      return selected ? option.labelSelected : option.label;
    },
    async updateField(field) {
      this.loading = true;
      let success = false;
      if (field !== null && this.fields[field] !== this[field]) {
        success = await this.updateData({
          id: this.id,
          field,
          value: this.fields[field],
        });
        if (success) {
          this.updateContactsListData({
            id: this.id,
            field,
            value: this.fields[field],
          });
        }
      }
      this.edit(null, success);
      this.loading = false;
    },
    isEmpty(val) {
      const valUndefinedOrEmptyString = !val || val === '';
      const valTranslateUndefined = val === this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Undefined');
      const valUndefinedString = val === 'UNDEFINED';
      return valUndefinedOrEmptyString || valTranslateUndefined || valUndefinedString;
    },
    formattedValue(value, status) {
      if (value === 'UNDEFINED') {
        return this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Undefined');
      }
      if (value) {
        return value;
      }
      if (status && status === 'Wrong') {
        return this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Wrong');
      }
      return this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')('Undefined');
    },
    getType(val, oldVal) {
      if (this.hasBeenReplaced(val, oldVal)) {
        return 'success';
      } else {
        const valIsEmpty = this.isEmpty(val);
        return valIsEmpty ? 'muted-light' : 'muted';
      }
    },

    hasBeenReplaced(newValue, oldValue) {
      if (!oldValue && !newValue) {
        return false;
      }
      return newValue !== oldValue;
    },

    edit(field = null, success = false) {
      if (field === null && this.currentFieldBeingEdited !== null && !success) {
        this.fields[this.currentFieldBeingEdited] = this[
          this.currentFieldBeingEdited
          ];
      } // reset
      this.currentFieldBeingEdited = field;
    },
    castToInt(value) {
      if (value !== null) {
        return +value;
      }

      return value;
    },
    castToBoolean(value) {
      if (value !== null) {
        return !!value;
      }
      return value;
    },
    resetLeadAssigner() {
      this.ticket.leadAssigner = null;
    },
    customerTitle(field){
      const title = field?.title ? field.title : 'Undefined';
      return this.formattedValue(this.$t_locale('components/cockpit/contacts/reviews/EditableTableRowContactsContacts')(title));
    }
  },
  watch: {
    'ticket.leadToCreate'(value) {
      if (value === null || value === 0) {
        this.ticket.leadAssigner = null;
      }
    },
    'ticket.resolved'(value) {
      if (value === null || value === 1) {
        this.ticket.assigner = null;
      }
    },
  },
};
</script>

<style lang="scss">
.unsatisfiedCriteria {
  cursor: pointer;
  flex: 1.8;
  margin-right: 0.5rem;
}

.score {
  cursor: pointer;
  flex: 0.6;
  margin-right: 0.5rem;
}

.basic {
  cursor: pointer;
  flex: 1.2;

  &:not(:last-child) {
    margin-right: 0.5rem;
  }
}

.multiselect__option--highlight:after {
  padding-left: 2px;
}

.multiselect--disabled {
  color: $grey !important;
}

.multiselector {
  cursor: pointer;

  .multiselect__tags {
    padding: 8px 10px 0 8px;
  }

  flex: 1;

  .multiselect__tags-wrap {
    line-height: 22px;
    margin-right: 5px;
  }

  &:not(:last-child) {
    margin-right: 0.5rem;
  }
}
</style>

<style lang="scss" scoped>
.input-field {
  &:not(:last-child) {
    margin-right: 0.5rem;
  }

  flex: 1;
}

strong {
  line-height: 1.5;
  padding: 0.3rem;
}

.pre-icon {
  padding: 5px;
}

.comment-zone {
  border: 1px solid $light-grey;
  border-radius: 3px;
  padding: 10px;
  background-color: $white;
  width: 100%;
  resize: none;

  &:disabled {
    color: #35495e;
    opacity: 0.6;
  }
}

.level {
  padding: 5px 0.8rem 5px 5px;
  font-size: 25px;
}
.icon-gs-happy {
  color: $green;
}
.icon-gs-sad {
  color: $red;
}
.icon-gs-straight {
  color: $yellow;
}

.row-bg {
  background-color: $active-cell-color;
  border-bottom: 1px solid $white;
}

.row-customer {
  background-color: $very-light-grey;

  &__score {
    flex: 1;

    * {
      flex: 1;
    }
  }

  &__assigner {
    flex: 1;

    * {
      flex: 1;
    }
  }

  &__info {
    display: flex;
    flex-flow: row;
    align-items: center;
    padding: 0.5rem 0;
  }

  &__button {
    display: flex;
    align-items: center;

    .button__content {
      display: flex;
      align-items: center;
    }
  }

  &__save {
    margin-right: 1rem;

    &:first-child {
      margin-left: auto;
    }
  }

  &__button-status {
    display: flex;

    &-content {
      display: flex;
    }

    &-content-text {
      flex: 1;
    }
  }

  &__button-baseline {
    font-size: 0.9rem;
    font-style: italic;
    color: $dark-grey;
    text-align: right;
    padding-right: 0.5rem;
  }

  &__sub-title {
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.54;
    letter-spacing: normal;
    text-align: left;
  }

  &__info-link {
    text-decoration-color: $blue;
    color: $blue;
  }

  &__info-value {
    flex: 1;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__info-label {
    margin-right: 0.5rem;
  }

  &__edit {
    border: none;
    background-color: transparent;
    cursor: pointer;
    padding: 0 0.5rem;
    height: 1.3rem;
    outline: 0;

    &:hover {
      color: $blue;
    }
  }

  &__content {
    display: flex;
    flex-flow: row;
  }

  &__status {
    text-align: center;
    padding: 1rem 0;

    .status-icon {
      font-size: 2rem;
    }

    .green {
      color: $green;
      border: 1px solid $green;
      border-radius: 4px;
      padding: 1rem;
    }

    .red {
      color: $red;
      border: 1px solid $red;
      border-radius: 4px;
      padding: 1rem;
    }

    .yellow {
      color: $yellow;
      border: 1px solid $yellow;
      border-radius: 4px;
      padding: 1rem;
    }
  }

  &__part {
    flex: 1;
  }

  &__assignation-part {
    flex: 0.7;

    &:not(:last-child) {
      border-right: 1px solid $white;
    }
  }

  &__value {
    flex-grow: 1;
  }

  &__group {
    display: flex;
    padding: 0.5rem 0;

    & > & {
      margin-bottom: 1rem;
    }

    & > .row-customer__label {
      margin-right: 0.5rem;
    }
  }
}
</style>
