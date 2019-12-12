import axios from 'axios';

// allow use http client without Vue instance
const apiUrl = 'http://172.21.131.97:8080/'
export const http = axios.create({
  baseURL: apiUrl,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  }
});

export const getRecommendations = payload => {
  return new Promise((resolve, reject) => {
    http({
      method: 'post',
      url: '/recommendations',
      data: payload
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    });
  })
}

export const ingest = payload => {
  return new Promise((resolve, reject) => {
    http({
      method: 'post',
      url: '/ingest/event',
      data: payload
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    });
  })
}
