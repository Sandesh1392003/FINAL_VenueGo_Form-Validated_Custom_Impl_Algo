import { gql } from "@apollo/client";

export const BOOK_VENUE = gql`
  mutation BookVenue($input: BookInput!) {
    bookVenue(input: $input) {
      id
      date
      totalPrice
      bookingStatus
      paymentStatus
      user {
        name
      }
      venue {
        name
      }
      timeslots {
        start
        end
      }
    }
  }
`;

// export const APPROVE_BOOKING = gql `

// mutation ApproveBooking($bookingId: ID!) {
//     approveBooking(bookingId: $bookingId) {
//         success
//         message
//     }
// }
// `
// export const REJECT_BOOKING = gql `

// mutation RejectBooking($bookingId: ID!) {
//     rejectBooking(bookingId: $bookingId) {
//         success
//         message
//     }
// }
// `
