import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID
};

export const userPool = new CognitoUserPool(poolData);

export function getCognitoUser(email) {
  return new CognitoUser({ Username: email, Pool: userPool });
}

export function signupUser({ fullName, email, password }) {
  const attributes = [
    new CognitoUserAttribute({ Name: "name", Value: fullName })
  ];

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(err);
      resolve(result.user);
    });
  });
}

export function confirmUser({ email, code }) {
  const user = getCognitoUser(email);
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

export function loginUser({ email, password }) {
  const user = getCognitoUser(email);
  const auth = new AuthenticationDetails({
    Username: email,
    Password: password
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(auth, {
      onSuccess: (result) => resolve(result),
      onFailure: (err) => reject(err)
    });
  });
}

export function forgotPassword(email) {
  const user = getCognitoUser(email);
  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: resolve,
      onFailure: reject,
      inputVerificationCode: () => resolve("CODE_SENT")
    });
  });
}

export function confirmNewPassword({ email, code, newPassword }) {
  const user = getCognitoUser(email);
  return new Promise((resolve, reject) => {
    user.confirmPassword(code, newPassword, {
      onSuccess: resolve,
      onFailure: reject
    });
  });
}
