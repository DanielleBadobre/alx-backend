const express = require('express');
const redis = require('redis');
const { promisify } = require('util');
const kue = require('kue');

// Initialize Express app
const app = express();
const port = 1245;

// Initialize Redis client
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Create Kue queue
const queue = kue.createQueue();

// Initialize reservation status
let reservationEnabled = true;

// Set initial available seats to 50
async function reserveSeat(number) {
  await setAsync('available_seats', number);
}

// Get current available seats
async function getCurrentAvailableSeats() {
  const seats = await getAsync('available_seats');
  return seats ? parseInt(seats, 10) : 0;
}

// Set initial number of available seats
reserveSeat(50);

// Route to get available seats
app.get('/available_seats', async (req, res) => {
  const availableSeats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: availableSeats.toString() });
});

// Route to reserve a seat
app.get('/reserve_seat', async (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: 'Reservations are blocked' });
  }

  // Queue the reservation job
  const job = queue.create('reserve_seat', {})
    .save((err) => {
      if (err) {
        return res.json({ status: 'Reservation failed' });
      }
      res.json({ status: 'Reservation in process' });
    });
  
  // Log job completion or failure
  job.on('complete', (result) => {
    console.log(`Seat reservation job ${job.id} completed`);
  });

  job.on('failed', (err) => {
    console.log(`Seat reservation job ${job.id} failed: ${err.message}`);
  });
});

// Route to process the reservation queue
app.get('/process', async (req, res) => {
  res.json({ status: 'Queue processing' });

  // Process the queue asynchronously
  queue.process('reserve_seat', async (job, done) => {
    try {
      const currentSeats = await getCurrentAvailableSeats();
      if (currentSeats > 0) {
        // Reserve a seat
        const newSeats = currentSeats - 1;
        await reserveSeat(newSeats);

        // If no seats are left, disable reservations
        if (newSeats === 0) {
          reservationEnabled = false;
        }

        done();
      } else {
        // If no seats available, fail the job
        done(new Error('Not enough seats available'));
      }
    } catch (error) {
      done(error);
    }
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
