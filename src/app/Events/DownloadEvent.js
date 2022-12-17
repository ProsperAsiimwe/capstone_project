const EventEmitter = require('events');
const { appConfig } = require('../../config');

class DownloadEvent extends EventEmitter {
  uraPortalURL = appConfig.URA_PORTAL_BASE_URL;

  constructor(data) {
    super({ captureRejections: true });
  }

  downloadUnebReport = (res, template, str, findRunningAdmission) => {
    this.on('downloadUnebReport', async () => {
      try {
        await res.download(
          template,
          `${str}-${findRunningAdmission.intake.metadata_value}-${findRunningAdmission.degreeCategory.metadata_value}-UNEB-REPORT.xlsx`,
          (error) => {
            if (error) {
              throw new Error(error.message);
            }
          }
        );
      } catch (error) {
        throw new Error(error.message);
      }
    });
    this.emit('downloadUnebReport');
    this.removeAllListeners();
  };
}

module.exports = DownloadEvent;
