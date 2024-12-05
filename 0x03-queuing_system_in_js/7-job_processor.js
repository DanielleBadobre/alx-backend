import kue from 'kue';

// Create a queue named 'push_notification_code_2'
const queue = kue.createQueue();

// Blacklisted phone numbers
const blacklisted = ['4153518780', '4153518781'];

// Function to send notifications
function sendNotification(phoneNumber, message, job, done) {
  // Track progress as 0 out of 100
  job.progress(0, 100);

  // Check if the phone number is blacklisted
  if (blacklisted.includes(phoneNumber)) {
    // If blacklisted, fail the job with an error
    job.fail(new Error(`Phone number ${phoneNumber} is blacklisted`));
    console.log(`Notification job #${job.id} failed: Phone number ${phoneNumber} is blacklisted`);
    done(job.failed());
    return;
  }

  // If not blacklisted, track progress to 50%
  job.progress(50, 100);
  console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);

  // Simulate sending the notification
  setTimeout(() => {
    console.log(`Notification job #${job.id} completed`);
    done();
  }, 1000); // Simulate some delay
}

// Set up queue processing
queue.process('push_notification_code_2', 2, (job, done) => {
  // Get phone number and message from the job data
  const { phoneNumber, message } = job.data;

  // Call the sendNotification function
  sendNotification(phoneNumber, message, job, done);
});
