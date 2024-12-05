import kue from 'kue';

// Create a queue named 'push_notification_code_3'
const queue = kue.createQueue();

/**
 * Function to create push notification jobs
 * @param {Array} jobs - Array of job objects
 * @param {Object} queue - Kue queue to add jobs to
 */
function createPushNotificationsJobs(jobs, queue) {
  if (!Array.isArray(jobs)) {
    throw new Error('Jobs is not an array');
  }

  // Loop through each job in the jobs array
  jobs.forEach((jobData) => {
    const job = queue.create('push_notification_code_3', jobData)
      .save((err) => {
        if (err) {
          console.log(`Notification job failed to create: ${err}`);
        } else {
          console.log(`Notification job created: ${job.id}`);
        }
      });

    // Job events
    job.on('complete', () => {
      console.log(`Notification job ${job.id} completed`);
    });

    job.on('failed', (errorMessage) => {
      console.log(`Notification job ${job.id} failed: ${errorMessage}`);
    });

    job.on('progress', (progress) => {
      console.log(`Notification job ${job.id} ${progress}% complete`);
    });
  });
}

export { createPushNotificationsJobs };
