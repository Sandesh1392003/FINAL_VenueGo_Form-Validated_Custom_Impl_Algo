import { gql } from "@apollo/client";

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password)     
  }
`;

const LOGOUT_USER = gql`
mutation logout{
    logout{
        message
        success
    }
}
`

const REGISTER_USER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
  register(name:$name, email: $email, password:$password) {
    message,
    success
  }
}
`;

const FORGOT_PASSWORD = gql`
mutation passwordReset($email: String!){
  passwordReset(email: $email){
    message,
    success
  }
}
`

const NEW_PASSWORD = gql`
mutation newPassword($token: String!, $password: String!){
  newPassword(token: $token, password: $password){
    message,
    success
  }
}

`

const VERIFICATION_CODE= gql`
mutation verfyuser($email: String!,$code: String!){
  verifyUser(email: $email,code: $code){
    token
  }
}
`

const RESEND_CODE = gql`
mutation resendCode($email: String!){
    resendCode(email: $email){
        message,
        success
    }
}
`

export {LOGIN_USER,REGISTER_USER,LOGOUT_USER, NEW_PASSWORD, RESEND_CODE, FORGOT_PASSWORD, VERIFICATION_CODE};
