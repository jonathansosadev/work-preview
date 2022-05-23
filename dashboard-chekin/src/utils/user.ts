import {User} from './types';
import {COLLABORATOR_GROUPS, SITEMINDER_ORIGINS} from './constants';

function getIsAccountOwner(user?: User | null) {
  return !Boolean(user?.manager);
}

function getIsAccountCollaborator(user?: User | null) {
  return Boolean(
    user?.groups?.some((group) => group?.name === COLLABORATOR_GROUPS.collaborator),
  );
}

function getIsAccountManager(user?: User | null) {
  return Boolean(
    user?.groups?.some((group) => group?.name === COLLABORATOR_GROUPS.manager),
  );
}

function getIsAccountOriginSiteMinder(user?: User | null) {
  return Boolean(
    user?.origin && Object.values(SITEMINDER_ORIGINS).includes(user?.origin),
  );
}

export {
  getIsAccountOwner,
  getIsAccountCollaborator,
  getIsAccountManager,
  getIsAccountOriginSiteMinder,
};
