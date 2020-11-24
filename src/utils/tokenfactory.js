const TokenStorageKey = 'ARWeb_token'
const ExpireStorageKey = (window.location.hostname) + '_expire'
let setToken = function (token) {
  return localStorage.setItem(TokenStorageKey, token)
}

let getToken = function () {
  return localStorage.getItem(TokenStorageKey)
}

let clearToken = function () {
  return localStorage.removeItem(TokenStorageKey)
}

let setExpire = function (expire){
  return localStorage.setItem(ExpireStorageKey, expire)
}

let getExpire = function () {
  return localStorage.getItem(ExpireStorageKey)
}

let clearExpire = function () {
  return localStorage.removeItem(ExpireStorageKey)
}

export default {
  setToken: setToken,
  getToken: getToken,
  clearToken: clearToken,
  setExpire: setExpire,
  getExpire: getExpire,
  clearExpire: clearExpire
}
