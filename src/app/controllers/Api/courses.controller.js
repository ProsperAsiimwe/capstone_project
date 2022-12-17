const { HttpResponse } = require('@helpers');
const axios = require('axios').default;
const { trim, toUpper } = require('lodash');
const envConfig = require('../../../config/app');
const http = new HttpResponse();

const { emisIntegration } = require('@services/index');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

class EmisCoursesController {
  async unescoCourseCategories(req, res) {
    try {
      const baseUrl = envConfig.EMIS_BASE_URL;

      // const response = await axios.get(${baseUrl}/course_categories).then((res) => res.data);
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/course_categories`,
      }).then((res) => res.data);

      if (response.statusCode === 200) {
        http.setSuccess(200, 'Course Categories fetched successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // school/emis_number/sponsors

  async universitySponsors(req, res) {
    try {
      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      const response = await axios({
        method: 'get',
        url: `${baseUrl}/school/${emisNumber}/sponsors`,
      }).then((res) => res.data);

      if (response.statusCode === 200) {
        http.setSuccess(200, 'Submitted Sponsors fetched successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Sponsor Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // entry schemes

  async universityEntryScheme(req, res) {
    try {
      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      const response = await axios({
        method: 'get',
        url: `${baseUrl}/school/${emisNumber}/entry_schemes`,
      }).then((res) => res.data);

      if (response.statusCode === 200) {
        http.setSuccess(200, 'Submitted Entry Schemes fetched successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Entry Scheme Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }
  // study levels
  async universityStudyLevels(req, res) {
    try {
      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      const response = await axios({
        method: 'get',
        url: `${baseUrl}/school/${emisNumber}/study_levels`,
      }).then((res) => res.data);

      if (response.statusCode === 200) {
        http.setSuccess(200, 'Study Levels fetched successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Study Level Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // campus
  async universityCampus(req, res) {
    try {
      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      const response = await axios({
        method: 'get',
        url: `${baseUrl}/school/${emisNumber}/school_campuses`,
      }).then((res) => res.data);

      if (response.statusCode === 200) {
        http.setSuccess(200, 'Campuses fetched successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Campus Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }
  // programme

  async universityProgrammes(req, res) {
    try {
      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      const response = await axios({
        method: 'get',
        url: `${baseUrl}/school/${emisNumber}/courses`,
      }).then((res) => res.data);

      if (response.statusCode === 200) {
        http.setSuccess(200, 'Courses fetched successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Courses Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // students

  async universityStudents(req, res) {
    try {
      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      const response = await axios({
        method: 'get',
        url: `${baseUrl}/school/${emisNumber}/students`,
      }).then((res) => res.data);

      if (response.statusCode === 200) {
        http.setSuccess(200, 'Students fetched successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Students Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = EmisCoursesController;
