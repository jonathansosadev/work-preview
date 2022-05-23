class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 403;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;
  }
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServerError';
    this.status = 500;
  }
}

module.exports = {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ServerError,
};
