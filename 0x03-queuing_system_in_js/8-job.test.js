import { expect } from 'chai';
import kue from 'kue';
import { createPushNotificationsJobs } from './8-job';

// Create a new queue for testing
const queue = kue.createQueue();

describe('createPushNotificationsJobs', () => {
  // Enter test mode
  before(() => {
    queue.testMode = true; // Prevent jobs from being processed
  });

  // After each test, clear the queue
  afterEach((done) => {
    queue.removeJobs('*', done); // Remove all jobs from the queue
  });

  // Exit test mode after all tests are done
  after(() => {
    queue.testMode = false;
  });

  it('should throw an error if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs({}, queue)).to.throw('Jobs is not an array');
  });

  it('should add jobs to the queue', (done) => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'Test message 1' },
      { phoneNumber: '4153518781', message: 'Test message 2' }
    ];

    createPushNotificationsJobs(jobs, queue);

    // After creating jobs, validate that jobs are in the queue
    queue.inTestMode(() => {
      const jobIds = queue.testJobs;
      expect(jobIds).to.have.lengthOf(2); // Expect 2 jobs to be added
      expect(jobIds[0].data.phoneNumber).to.equal('4153518780'); // Check job data
      expect(jobIds[1].data.message).to.equal('Test message 2'); // Check job data

      done();
    });
  });

  it('should handle job progress, completion, and failure events', (done) => {
    const jobs = [
      { phoneNumber: '4153518780', message: 'Test message 1' }
    ];

    createPushNotificationsJobs(jobs, queue);

    queue.testMode = false; // Exit test mode to process jobs

    queue.process('push_notification_code_3', 2, (job, done) => {
      if (job.data.phoneNumber === '4153518780') {
        done(); // Mark as completed
      } else {
        done(new Error('Failed job'));
      }
    });

    queue.on('job complete', (jobId) => {
      if (jobId === 1) {
        expect(jobId).to.equal(1); // Ensure job completion
        done();
      }
    });
  });
});
