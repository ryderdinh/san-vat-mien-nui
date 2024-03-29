const app = require('./app');
const config = require('./config/config');
const fs = require('fs');
const logger = require('./config/logger');
const mongoose = require('mongoose');
const https = require('https');

let server;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  if (config.env === 'production' && config.ssl !== 'non') {
    // Certificate
    const privateKey = fs.readFileSync(
      '/etc/letsencrypt/live/savaminu.com/privkey.pem',
      'utf8'
    );
    const certificate = fs.readFileSync(
      '/etc/letsencrypt/live/savaminu.com/cert.pem',
      'utf8'
    );
    const ca = fs.readFileSync(
      '/etc/letsencrypt/live/savaminu.com/chain.pem',
      'utf8'
    );

    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca
    };

    server = https.createServer(credentials, app).listen(config.ports, () => {
      logger.info(`Listening to port ${config.ports}`);
    });
  } else {
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  }
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
