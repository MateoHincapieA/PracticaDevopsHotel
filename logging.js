const { Logging } = require('@google-cloud/logging');

// Crea una instancia de cliente para Cloud Logging
const logging = new Logging();

// El nombre del log que verás en la consola de Cloud Logging
const logName = 'devopsHotel-log';
const log = logging.log(logName);

// Exporta las funciones para escribir logs
module.exports = {
  logMessage: (message, level = 'info') => {
    const entry = log.entry({ severity: level }, message);
    log.write(entry);
  },
  logError: (error) => {
    const entry = log.entry({ severity: 'error' }, error);
    log.write(entry);
  }
};