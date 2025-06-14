//Using API / SDK

// import { MailtrapClient } from "mailtrap";

// if (!process.env.MAILTRAP_TOKEN) {
//   throw new Error("MAILTRAP_TOKEN is not defined in .env file");
// }

// export const client = new MailtrapClient({
//   token: process.env.MAILTRAP_TOKEN
// });

// export const sender = {
//   email: "admin@rajeshshrestha2059.com.np",
//   name: "From VenueVerse",
// };




// const sendEmail = async () => {
//     const email="cocof100mb@gmail.com"
//     try {
//       await client.send({
//         to: [{email}],
//         from: sender,
//         subject: "Test Email",
//         text: "This is a test email",
//       });
//       console.log("Email sent successfully");
//     } catch (error) {
//       console.error("Error sending email:", error);
//     }
//   };

//   sendEmail();




//Using Nodemailer
import { createTransport } from "nodemailer";
import { MailtrapTransport } from "mailtrap";

const TOKEN = "e79dac4f09d8f03eed7658a7196e31e9";

export const transport = createTransport(
  MailtrapTransport({
    token: TOKEN,
    testInboxId: 3647756,
  })
);

export const sender = {
  address: "hello@example.com",
  name: "Mailtrap Test",
};


// //Using Nodemailer with SMTP
// import nodemailer from "nodemailer"; // Use this instead of just createTransport

// export const transport = nodemailer.createTransport({
//   host: "live.smtp.mailtrap.io",
//   port: 587,
//   auth: {
//     user: process.env.MAILTRAP_USER, // "api" is correct when using token
//     pass: process.env.MAILTRAP_TOKEN,   // Your Mailtrap sending token
//   },
// });

// transport.verify((error, success) => {
//   if (error) {
//     console.log("Error verifying transport: ", error);
//   } else {
//     console.log("Mailtrap connection successful!", success);
//   }
// });


// export const sender = {
//   address: process.env.MY_DOMAIN, // Should be your verified domain email
//   name: "VenueVerse",
// };

