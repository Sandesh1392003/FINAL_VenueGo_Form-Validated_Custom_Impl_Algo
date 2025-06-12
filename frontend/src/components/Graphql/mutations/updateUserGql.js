import { gql } from "@apollo/client";


const UPDATE_USER_DETAILS = gql`
mutation UpdateUserDetails($input: UserInput!) {
    updateUserDetails(input: $input) {
        success
        message
    }
}

`
export { UPDATE_USER_DETAILS}