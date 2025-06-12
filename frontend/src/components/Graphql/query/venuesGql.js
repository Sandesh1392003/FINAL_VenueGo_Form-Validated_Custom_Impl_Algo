import { gql } from "@apollo/client";

const VENUES = gql`
  query Venues {
    venues {
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
      image {
        public_id
        secure_url
      }
      services {
        serviceId {
          id
          name
        }
        servicePrice
      }
    }
  }
`;

const VENUE_BY_ID = gql`
  query Venue($id: ID!) {
    venue(id: $id) {
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
      owner {
        name
        email
        phone
      }
      reviews {
        id
        rating
        comment
        user {
          name
        }
      }
      bookings{
        bookingStatus
        paymentStatus
        user{
          name
        }
        totalPrice
      }
      services {
        servicePrice
        serviceId {
          id
          name
          image {
            public_id
            secure_url
          }
        }
      }
      image {
        public_id
        secure_url
      }
      bookings {
        id
        date
        timeslots {
          start
          end
        }
      }
    }
  }
`;

const GET_SERVICES = gql`
  query Services {
    services {
      id
      name
      image {
        public_id
        secure_url
      }
    }
  }
`;

export { VENUE_BY_ID, VENUES, GET_SERVICES };
