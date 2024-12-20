import redis from 'redis';

const client = redis.createClient();

client.on('connect', () => {
  console.log('Redis client connected to the server');
});

client.on('error', (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

client.subscribe('holberton school channel');

client.on('message', (channel, message) => {
  console.log(message);  // Log the received message

  if (message === 'KILL_SERVER') {
    console.log('Unsubscribing and quitting...');
    client.unsubscribe();
    client.quit();
  }
});
