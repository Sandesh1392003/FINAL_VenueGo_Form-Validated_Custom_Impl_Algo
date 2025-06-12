import { gql } from "@apollo/client";

export const ADD_VENUE = gql`
  mutation AddVenue($venueInput: venueInput!) {
    addVenue(input: $venueInput) {
      id
      name
      description
      basePricePerHour
      capacity
      categories
      image {
        public_id
        secure_url
      }
    }
  }
`;

export const UPDATE_VENUE = gql`
  mutation UpdateVenue($id: ID!, $updateVenueInput: UpdateVenueInput!) {
    updateVenue(id: $id, input: $updateVenueInput) {
      success
      message
    }
  }
`;

export const REMOVE_VENUE = gql`
  mutation RemoveVenue($venueId: ID!) {
    removeVenue(venueId: $venueId) {
      success
      message
    }
  }
`;
