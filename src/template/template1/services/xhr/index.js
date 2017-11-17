import axios from 'axios';
import mock from '../../../mock/index'
import settle from 'axios/lib/core/settle'
import httpCodeService from './httpCodeService'


class Service {
  constructor() {
    let service = axios.create({
      headers: {csrf: 'token'}
    });
    service.interceptors.response.use(this.handleSuccess, this.handleError);
    service.interceptors.request.use(this.handleRequest);
    this.service = service;
  }

  handleRequest(config) {
    config.adapter = config => {
      return new Promise((resolve, reject) => {
        let data = mock(config.url, config.method);
        let response = {
          config: config,
          status: data.header.status,
          statusText: httpCodeService.get(data.header.status)
        };

        settle(resolve, reject, Object.assign(response, data));
      });
    };
    return config;
  }

  handleSuccess(response) {
    return response;
  }

  handleError = (error) => {
    switch (error.response.status) {
      case 401:
        this.redirectTo(document, '/');
        break;
      case 404:
        this.redirectTo(document, '/404');
        break;
      default:
        this.redirectTo(document, '/500');
        break;
    }
    return Promise.reject(error)
  };

  redirectTo = (document, path) => {
    document.location = path
  };

  get(path, callback) {
    let request = this.service.get(path);
    if (typeof callback === 'function') {
      return request.then();
    }
    return request;
  }

  patch(path, payload, callback) {
    let request = this.service.request({
      method: 'PATCH',
      url: path,
      responseType: 'json',
      data: payload
    });
    if (typeof callback === 'function') {
      return request.then((response) => callback(response.status, response.data));
    }
    return request;
  }

  post(path, payload, callback) {
    let request = this.service.request({
      method: 'POST',
      url: path,
      responseType: 'json',
      data: payload
    });
    if (typeof callback === 'function') {
      return request.then((response) => callback(response.status, response.data));
    }
    return request
  }
}

export default new Service;
