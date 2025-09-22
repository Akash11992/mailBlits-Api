const cron = require('node-cron');
const cleanListTempData = require('./jobs/clean_list_temp_data');

// Schedule to run every 10 minutes
cron.schedule('0 0 * * *', cleanListTempData, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});
