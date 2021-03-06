const notify = require('../utils/notify').notify;

const express = require('express');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
const app = express();
// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = !(process.env.NODE_ENV === 'production');

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server
  // const host = process.env.SITE_HOST || `localhost`;
  // const port = process.env.HOST || 3001;

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });

  var CronJob = require('cron').CronJob;
  // Friday 11:45
  new CronJob(process.env.NOTIFY_SCHEDULE, async function() {
    await notify();
  }, null, true, 'America/Los_Angeles');
}
start();
