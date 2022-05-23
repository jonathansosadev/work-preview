
export function validateEmail(email) {
  if (!email || email.length <= 0) {
    return 'empty';
  } else if (!email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) { // eslint-disable-line no-useless-escape,max-len
    return 'invalid';
  }
  return 'OK';
}