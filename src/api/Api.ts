/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface MapPoolFilter {
  /**
   * Start date
   * Дата начала для фильтрации (в формате ГГГГ-ММ-ДД).
   * @format date
   */
  start_date?: string;
  /**
   * End date
   * Дата окончания для фильтрации (в формате ГГГГ-ММ-ДД).
   * @format date
   */
  end_date?: string;
}

export interface PlayerLogin {
  /**
   * Player login
   * @minLength 1
   */
  player_login: string;
}

export interface Complete {
  /**
   * Action
   * @minLength 1
   * @default "complete"
   */
  action?: string;
}

export interface MapFilter {
  /**
   * Title
   * @minLength 1
   */
  title?: string;
}

export interface Map {
  /** ID */
  id?: number;
  /**
   * Title
   * @minLength 1
   * @maxLength 255
   */
  title: string;
  /**
   * Description
   * @minLength 1
   */
  description: string;
  /** Status */
  status: "active" | "deleted";
  /**
   * Image url
   * @format uri
   * @minLength 1
   */
  image_url?: string | null;
  /**
   * Players
   * @minLength 1
   * @maxLength 50
   */
  players: string;
  /**
   * Tileset
   * @minLength 1
   * @maxLength 50
   */
  tileset: string;
  /**
   * Overview
   * @minLength 1
   */
  overview: string;
}

export interface Draft {
  /**
   * Map id
   * @default 1
   */
  map_id?: number;
}

export interface UserProfile {
  /**
   * Username
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * First name
   * @maxLength 150
   */
  first_name?: string;
  /**
   * Last name
   * @maxLength 150
   */
  last_name?: string;
  /**
   * Staff status
   * Designates whether the user can log into this admin site.
   */
  is_staff?: boolean;
}

export interface Register {
  /**
   * Username
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * First name
   * @maxLength 150
   */
  first_name?: string;
  /**
   * Last name
   * @maxLength 150
   */
  last_name?: string;
  /**
   * Is staff
   * @default false
   */
  is_staff?: boolean;
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://localhost:8000/api" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Snippets API
 * @version v1
 * @license BSD License
 * @termsOfService https://www.google.com/policies/terms/
 * @baseUrl http://localhost:8000/api
 * @contact <contact@snippets.local>
 *
 * Test description
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  mapPools = {
    /**
     * No description
     *
     * @tags map_pools
     * @name MapPoolsList
     * @request GET:/map_pools/
     * @secure
     */
    mapPoolsList: (
      query?: {
        /**
         * Дата начала для фильтрации (в формате ГГГГ-ММ-ДД).
         * @format date
         */
        start_date?: string;
        /**
         * Дата окончания для фильтрации (в формате ГГГГ-ММ-ДД).
         * @format date
         */
        end_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<MapPoolFilter[], any>({
        path: `/map_pools/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags map_pools
     * @name MapPoolsRead
     * @request GET:/map_pools/{id}/
     * @secure
     */
    mapPoolsRead: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/map_pools/${id}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags map_pools
     * @name MapPoolsUpdate
     * @request PUT:/map_pools/{id}/
     * @secure
     */
    mapPoolsUpdate: (id: string, data: PlayerLogin, params: RequestParams = {}) =>
      this.request<PlayerLogin, any>({
        path: `/map_pools/${id}/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags map_pools
     * @name MapPoolsDelete
     * @request DELETE:/map_pools/{id}/
     * @secure
     */
    mapPoolsDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/map_pools/${id}/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags map_pools
     * @name MapPoolsCompleteUpdate
     * @request PUT:/map_pools/{id}/complete/
     * @secure
     */
    mapPoolsCompleteUpdate: (id: string, data: Complete, params: RequestParams = {}) =>
      this.request<Complete, any>({
        path: `/map_pools/${id}/complete/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags map_pools
     * @name MapPoolsSubmitUpdate
     * @request PUT:/map_pools/{id}/submit/
     * @secure
     */
    mapPoolsSubmitUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/map_pools/${id}/submit/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags map_pools
     * @name MapPoolsMapDelete
     * @request DELETE:/map_pools/{map_pool_id}/map/{map_id}/
     * @secure
     */
    mapPoolsMapDelete: (mapPoolId: string, mapId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/map_pools/${mapPoolId}/map/${mapId}/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags map_pools
     * @name MapPoolsMapPositionUpdate
     * @request PUT:/map_pools/{map_pool_id}/map/{map_id}/position/
     * @secure
     */
    mapPoolsMapPositionUpdate: (mapPoolId: string, mapId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/map_pools/${mapPoolId}/map/${mapId}/position/`,
        method: "PUT",
        secure: true,
        ...params,
      }),
  };
  maps = {
    /**
     * No description
     *
     * @tags maps
     * @name MapsList
     * @request GET:/maps/
     * @secure
     */
    mapsList: (
      query?: {
        /** @minLength 1 */
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<MapFilter[], any>({
        path: `/maps/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags maps
     * @name MapsCreate
     * @request POST:/maps/
     * @secure
     */
    mapsCreate: (data: Map, params: RequestParams = {}) =>
      this.request<Map, any>({
        path: `/maps/`,
        method: "POST",
        body: data,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags maps
     * @name MapsDraftCreate
     * @request POST:/maps/draft/
     * @secure
     */
    mapsDraftCreate: (data: Draft, params: RequestParams = {}) =>
      this.request<Draft, any>({
        path: `/maps/draft/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags maps
     * @name MapsRead
     * @request GET:/maps/{id}/
     * @secure
     */
    mapsRead: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/maps/${id}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags maps
     * @name MapsUpdate
     * @request PUT:/maps/{id}/
     * @secure
     */
    mapsUpdate: (id: string, data: Map, params: RequestParams = {}) =>
      this.request<Map, any>({
        path: `/maps/${id}/`,
        method: "PUT",
        body: data,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags maps
     * @name MapsDelete
     * @request DELETE:/maps/{id}/
     * @secure
     */
    mapsDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/maps/${id}/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags maps
     * @name MapsImageCreate
     * @request POST:/maps/{id}/image/
     * @secure
     */
    mapsImageCreate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/maps/${id}/image/`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name UsersLoginCreate
     * @request POST:/users/login/
     * @secure
     */
    usersLoginCreate: (
      data: {
        /** Имя пользователя */
        username?: string;
        /** Пароль */
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** Имя пользователя */
          username?: string;
          /** Пароль */
          password?: string;
        },
        any
      >({
        path: `/users/login/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersLogoutCreate
     * @request POST:/users/logout/
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/logout/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Получение профиля текущего пользователя
     *
     * @tags users
     * @name UsersProfileUpdate
     * @request PUT:/users/profile/
     * @secure
     */
    usersProfileUpdate: (params: RequestParams = {}) =>
      this.request<UserProfile, any>({
        path: `/users/profile/`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersRegisterCreate
     * @request POST:/users/register/
     * @secure
     */
    usersRegisterCreate: (data: Register, params: RequestParams = {}) =>
      this.request<Register, any>({
        path: `/users/register/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
