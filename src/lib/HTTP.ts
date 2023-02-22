import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  Method,
  ResponseType,
  HeadersDefaults,
} from 'axios';
import { URLSearchParams } from 'url';

import type { KeyValuePair, HTTPResponse } from '../types';
import { debug } from '../utils';

export class HTTP {
  /**
   * 5XX errors retry limit
   */
  public restRetryLimit = 5;

  /**
   * The default requests options
   */
  public options: AxiosRequestConfig;

  /**
   * The axios instance
   * @type {AxiosInstance}
   */
  public axios: AxiosInstance;

  /**
   * @param {Client} client The main client
   */
  constructor(options?: AxiosRequestConfig) {
    this.options = {
      ...options,
    };

    this.axios = axios.create(this.options);

    // Clear all default content type headers
    (
      Object.keys(this.axios.defaults.headers) as (keyof HeadersDefaults)[]
    ).forEach(h => {
      delete this.axios.defaults.headers[h]?.['Content-Type'];
    });
  }

  /**
   * Sends a HTTP request
   * @param method The HTTP method
   * @param url The uri
   * @param headers The headers
   * @param data The body
   * @param form The form
   * @param responseType The axios response type
   * @param retries The retry amount of the request if it fails
   */
  async send<T>(
    method: Method,
    url: string,
    headers: KeyValuePair<string> = {},
    body?: KeyValuePair<string | number | boolean | unknown[]> | string,
    form?: KeyValuePair<string>,
    responseType?: ResponseType,
    retries = 0
  ): Promise<HTTPResponse<T>> {
    let data;

    if (body) data = body;
    else if (form) {
      const urlSearchParams = new URLSearchParams();
      // eslint-disable-next-line no-restricted-syntax
      for (const key of Object.keys(form)) {
        urlSearchParams.append(key, form[key]);
      }

      data = urlSearchParams;
    }

    const reqStartTime = Date.now();
    try {
      const response = await this.axios.request({
        method,
        url,
        headers,
        data,
        responseType,
      });
      debug(
        `${method} ${url} (${((Date.now() - reqStartTime) / 1000).toFixed(
          2
        )}s): ${response.status} ${response.statusText || '???'}`
      );

      return { data: response.data };
    } catch (_e) {
      const err = _e as AxiosError;
      debug(
        `${method} ${url} (${((Date.now() - reqStartTime) / 1000).toFixed(
          2
        )}s): ` +
          `${err.response?.status || '???'} ${
            err.response?.statusText || '???'
          }`,
        'http'
      );

      const errResponse = (err as AxiosError).response;
      const errResponseData = errResponse?.data as KeyValuePair<string>;

      if (
        errResponse?.status.toString().startsWith('5') &&
        retries < this.restRetryLimit
      ) {
        return this.send(
          method,
          url,
          headers,
          body,
          form,
          responseType,
          retries + 1
        );
      }

      if (errResponse && errResponse.status === 429) {
        const retryString =
          errResponse.headers['retry-after'] ||
          errResponseData?.messageVars?.[0] ||
          errResponseData?.errorMessage?.match(/(?<=in )\d+(?= second)/)?.[0];
        const retryAfter = parseInt(retryString, 10);
        if (!Number.isNaN(retryAfter)) {
          const sleepTimeout = retryAfter * 1000 + 500;
          await new Promise(res => {
            setTimeout(res, sleepTimeout);
          });

          return this.send(method, url, headers, body, form, responseType);
        }
      }

      return {
        error: err as AxiosError,
      };
    }
  }
}
