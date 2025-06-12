// addDefaultCategoryToServices.mjs (or ensure "type": "module" is in package.json)

import mongoose from 'mongoose';
import Venue from './models/Venue.js';

// Connect to your DB
mongoose.connect('mongodb+srv://theDeveloper:bjL9V8eSStWqlx2C@tester.hjvx0.mongodb.net/thoughts?retryWrites=true&w=majority', {
});

async function addDefaultCategoryToServices() {
  try {
    const venues = await Venue.find({});

    for (const venue of venues) {
      let updated = false;

      venue.services = venue.services.map(service => {
        if (!service.category) {
          updated = true;
          return {
            ...service.toObject(), // to avoid Mongoose internals
            category: 'fixed', // or "hourly" based on logic
          };
        }
        return service;
      });

      if (updated) {
        await venue.save();
        console.log(`Updated venue ${venue.name}`);
      }
    }

    console.log('Done updating venues.');
  } catch (err) {
    console.error('Error updating venues:', err);
  } finally {
    mongoose.disconnect();
  }
}

addDefaultCategoryToServices();
