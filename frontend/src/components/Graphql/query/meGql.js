import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      roleApprovalStatus
      esewaId
      bookings {
        id
        date
        totalPrice
        bookingStatus
        paymentStatus
        timeslots {
          start
          end
        }
        venue {
          name
          id
        }
        user {
          name
        }
      }
      profileImg {
        public_id
        secure_url
      }
      legalDocImg {
        public_id
        secure_url
      }
      address
      phone
      reviews {
        id
        rating
        comment
      }
      location {
        street
        province
        zipCode
        city
      }
    }
  }
`;

export const MY_VENUES = gql`
  query MyVenues {
    myVenues {
      id
      name
      description
      basePricePerHour
      capacity
      categories
      location {
        street
        province
        zipCode
        city
      }
      reviews {
        id
        rating
        comment
      }

      bookings {
        id
        date
        totalPrice
        bookingStatus
        paymentStatus
        additionalNotes
        attendees
        user {
          name
          email
          phone
        }
        venue {
          id
        }
        timeslots {
          start
          end
        }
      }
      image {
        public_id
        secure_url
      }
      services {
        servicePrice
        serviceId {
          id
          name
          image {
            secure_url
            public_id
          }
        }
      }
    }
    services {
      id
      name
    }
  }
`;

export const MY_BOOKINGS = gql`
  query Booking($id: ID!) {
    booking(id: $id) {
      id
      date
      totalPrice
      bookingStatus
      paymentStatus
      user {
        name
      }
      timeslots {
        start
        end
      }
      phone
      attendees
      additionalNotes
      eventType
      venue {
        id
        name
        description
        approvalStatus
        location {
          street
          province
          zipCode
          city
        }
        basePricePerHour
        capacity
      }
      createdAt
      selectedServices {
        servicePrice
        serviceId {
          name
          id
        }
      }
    }
  }
`;
