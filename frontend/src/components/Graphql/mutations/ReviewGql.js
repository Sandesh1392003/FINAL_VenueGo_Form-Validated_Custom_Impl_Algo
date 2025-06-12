import { gql } from "@apollo/client";

const CREATE_REVIEW = gql`
  mutation AddReview($input: ReviewInput!) {
    addReview(input: $input) {
      response {
        success
        message
      }
    }
  }
`;

export { CREATE_REVIEW };
