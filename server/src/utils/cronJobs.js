const cron = require('node-cron');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendEmail } = require('./email');

/**
 * Initialize all scheduled tasks
 */
const initCronJobs = () => {
  // Run every 24 hours at 00:00 (Midnight)
  // Format: second minute hour day-of-month month day-of-week
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily arena status pulse...');
    
    try {
      const activeProject = await Project.findOne({ status: 'active' });
      
      if (activeProject) {
        const participants = await User.find({ role: 'participant' }, 'email name');
        const emails = participants.map(p => p.email).filter(Boolean);
        
        if (emails.length > 0) {
          const now = new Date();
          const end = new Date(activeProject.endDate);
          const diffMs = end - now;
          
          if (diffMs > 0) {
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            const timeRemaining = `${days}d ${hours}h ${minutes}m`;

            const html = `
              <div style="font-family: sans-serif; background-color: #09090b; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #10b981;">
                <h2 style="color: #10b981; text-transform: uppercase;">Arena Status Reminder</h2>
                <p>Execution remains in progress for phase: <strong>${activeProject.title}</strong></p>
                <div style="background-color: #18181b; padding: 20px; border-radius: 12px; margin: 20px 0;">
                  <p style="color: #71717a; font-size: 12px; margin-bottom: 5px; text-transform: uppercase;">Time Remaining</p>
                  <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 0;">${timeRemaining}</p>
                </div>
                <p>Log in to update your submission and verify peer metrics.</p>
                <p style="font-size: 12px; color: #71717a;"><a href="${process.env.CLIENT_ORIGIN}" style="color: #10b981;">Return to Arena</a></p>
              </div>
            `;

            await sendEmail(emails, `[REMAINDER] ${activeProject.title} - T-Minus ${days} Days`, html);
          }
        }
      }
    } catch (err) {
      console.error('[CRON ERROR] Daily reminder failed:', err);
    }
  });

  console.log('Cron Job established: Daily Pulse (24hrs)');
};

module.exports = { initCronJobs };
