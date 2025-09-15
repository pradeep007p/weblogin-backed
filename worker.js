require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true }).then(()=> logger.info('Worker Mongo connected')).catch(err=> logger.error(err));

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const worker = new Worker('proxy-health', async job => {
  const { host, port } = job.data;
  logger.info('Checking proxy', host, port);
  // placeholder check (real check should attempt request)
  const healthy = true;
  return { id: job.id, healthy };
}, { connection });

worker.on('completed', job => logger.info('job completed '+job.id));
worker.on('failed', (job, err) => logger.error('job failed '+err.message));
