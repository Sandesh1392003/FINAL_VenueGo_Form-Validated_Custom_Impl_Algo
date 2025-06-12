import { gql } from "@apollo/client";

export const UPDATE_USER_DETAILS = gql`
  mutation updateUserDetails($input: UserInput!) {
    updateUserDetails(input: $input) {
      success
      message
    }
  }
`;
