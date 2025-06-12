import mongoose from 'mongoose';
import User from './models/user.js';

// MongoDB connection
mongoose.connect('mongodb+srv://batman:CLDmtVIeX2Jwok1h@cluster0.pzhbkmx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {

});

// Function to add admin user
async function addAdmin() {
    try {
        const adminUser = new User({
            name: 'Admin', // Updated field to match the model
            email: 'admin', // Use a valid email format
            password: 'admin',
            role: 'Admin', // Match the enum value in the model
            verified: true, // Set verified to true for admin
        });

        const result = await adminUser.save();
        console.log('Admin user added:', result);
    } catch (error) {
        console.error('Error adding admin user:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Execute the function
addAdmin();