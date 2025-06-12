import { gql } from "@apollo/client";

export const VERIFY_PAYMENT = gql`
  mutation verifyPayment($transactionId: String!) {
    verifyPayment(transactionId: $transactionId) {
      success
      message
    }
  }
`;


export const INITIATE_PAYMENT = gql`
mutation InitiatePayment($bookingId: ID!, $amount:Int!) {
    initiatePayment(bookingId: $bookingId, amount: $amount) {
        transactionId
        response {
            success
            message
        }
    }
}

`

export const GEN_SIGNATURE = gql`
mutation GenerateSignature($total_amount: Float!, $transaction_uuid: String!, $product_code: String!) {
    generateSignature(total_amount: $total_amount, transaction_uuid: $transaction_uuid, product_code: $product_code) {
        signature
        signed_field_names
    }
}

`