import winston from 'winston';

export const createLogger = (verbose = false) => {
  const level = verbose ? 'debug' : 'info';
  const silent = process.env.NODE_ENV === 'test';
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level: logLevel, message }) => {
        return `${timestamp} | ${logLevel} | ${message}`;
      })
    ),
    transports: [new winston.transports.Console({ level, handleExceptions: true, silent })],
  });
};
