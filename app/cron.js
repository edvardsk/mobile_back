const CronJob = require('cron').CronJob;
const CronService = require('./services/cron');

new CronJob({
    cronTime: '0 0 2 * * *', //every day at 00:02:00 by UTC+0
    onTick: CronService.updateExchangeRates,
    start: true,
    timeZone: 'Europe/London',
});
