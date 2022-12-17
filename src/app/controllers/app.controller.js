const { HttpResponse } = require('../helpers');

const http = new HttpResponse();

class AppController {
  /**
   * App Index endpoint
   *
   * @param {*} req Request
   * @param {*} res Response
   */
  static index(req, res) {
    http.setSuccess(200, 'App Works.');

    return http.send(res);
  }
}

module.exports = AppController;
