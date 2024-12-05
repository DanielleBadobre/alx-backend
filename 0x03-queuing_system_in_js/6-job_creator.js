import kue from 'kue';

// Create a queue named 'push_notification_code'
const queue = kue.createQueue();

// Define a job object
const jobData = {
  phoneNumber: '1234567890',
  message: 'Your verification code is 12345'
};

// Create a job in the queue
const job = queue.create('push_notification_code', jobData)
  .save((err) => {
    if (err) {
      console.log('Job creation failed:', err);
    } else {
      console.log(`Notification job created: ${job.id}`);
    }
  });

// Job event listeners
job.on('complete', () => {
  console.log('Notification job completed');
});

job.on('failed', (errorMessage) => {
  console.log(`Notification job failed: ${errorMessage}`);
});
