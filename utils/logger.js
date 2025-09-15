const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(format.colorize(), format.simple()),
  transports: [ new transports.Console() ]
});

module.exports = logger;
