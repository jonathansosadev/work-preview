import api, {queryFetcher, resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `seasons/?${params}`,
  one: (id: string) => `seasons/${id}/`,
  links: () => `season-links/`,
  oneLink: (id: string) => `season-links/${id}/`,
};

function get(params = '') {
  return resolver(ENDPOINTS.all(params));
}

function getOne(id: string) {
  return resolver(ENDPOINTS.one(id));
}

function post(payload: any) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patch(id: string, payload: any) {
  return resolver(ENDPOINTS.one(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function link(housingId: string, seasonId: string) {
  const payload = {
    housing_id: housingId,
    season_id: seasonId,
  };

  return resolver(ENDPOINTS.links(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function deleteLink(id: string) {
  return resolver(ENDPOINTS.oneLink(id), {
    method: 'DELETE',
  });
}

function deleteOne(id: string) {
  return resolver(ENDPOINTS.one(id), {
    method: 'DELETE',
  });
}

function fetchSeason(id: string) {
  return queryFetcher(api.seasons.ENDPOINTS.one(id));
}

export {ENDPOINTS, get, post, getOne, patch, link, deleteLink, deleteOne, fetchSeason};
