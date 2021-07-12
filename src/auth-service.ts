import { HttpClient, json } from "@aurelia/fetch-client";
import { Authentication } from "./authentication";
import { OAuth1 } from "./oAuth1";
import { OAuth2 } from "./oAuth2";
import { status, joinUrl } from "./auth-utilities";
import { EventAggregator } from "@aurelia/kernel";
import { IAuthOptions } from "./aurelia-auth";
import { IAuthConfigOptions } from "configuration";

export class AuthService {
  protected tokenInterceptor;

  constructor(
    readonly http: HttpClient,
    readonly auth: Authentication,
    readonly oAuth1: OAuth1,
    readonly oAuth2: OAuth2,
    @IAuthOptions readonly config: IAuthConfigOptions,
    readonly eventAggregator: EventAggregator
  ) {
    this.tokenInterceptor = auth.tokenInterceptor;
  }

  getMe() {
    let profileUrl = this.auth.getProfileUrl();
    return this.http.fetch(profileUrl).then(status);
  }

  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  getTokenPayload() {
    return this.auth.getPayload();
  }

  setToken(token) {
    this.auth.setToken(
      Object.defineProperty({}, this.config.tokenName, { value: token })
    );
  }

  signup(displayName, email, password) {
    let signupUrl = this.auth.getSignupUrl();
    let content;
    if (typeof arguments[0] === "object") {
      content = arguments[0];
    } else {
      content = {
        displayName: displayName,
        email: email,
        password: password,
      };
    }

    return this.http
      .fetch(signupUrl, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: json(content),
      })
      .then(status)
      .then((response) => {
        if (this.config.loginOnSignup) {
          this.auth.setToken(response);
        } else if (this.config.signupRedirect) {
          window.location.href = this.config.signupRedirect;
        }
        this.eventAggregator.publish("auth:signup", response);
        return response;
      });
  }

  login(email, password) {
    let loginUrl = this.auth.getLoginUrl();
    let content;
    if (typeof arguments[1] !== "string") {
      content = arguments[0];
    } else {
      content = {
        email: email,
        password: password,
      };
    }

    return this.http
      .fetch(loginUrl, {
        method: "post",
        headers:
          typeof content === "string"
            ? { "Content-Type": "application/x-www-form-urlencoded" }
            : {},
        body: typeof content === "string" ? content : json(content),
      })
      .then(status)
      .then((response) => {
        this.auth.setToken(response);
        this.eventAggregator.publish("auth:login", response);
        return response;
      });
  }

  logout(redirectUri) {
    return this.auth.logout(redirectUri).then(() => {
      this.eventAggregator.publish("auth:logout");
    });
  }

  authenticate(name, redirect, userData) {
    let provider: OAuth1 | OAuth2 = this.oAuth2;

    if (this.config.providers[name].type === "1.0") {
      provider = this.oAuth1;
    }

    return provider
      .open(this.config.providers[name], userData || {})
      .then((response) => {
        this.auth.setToken(response, redirect);
        this.eventAggregator.publish("auth:authenticate", response);
        return response;
      });
  }

  unlink(provider) {
    let unlinkUrl = this.config.baseUrl
      ? joinUrl(this.config.baseUrl, this.config.unlinkUrl)
      : this.config.unlinkUrl;

    if (this.config.unlinkMethod === "get") {
      return this.http
        .fetch(unlinkUrl + provider)
        .then(status)
        .then((response) => {
          this.eventAggregator.publish("auth:unlink", response);
          return response;
        });
    } else if (this.config.unlinkMethod === "post") {
      return this.http
        .fetch(unlinkUrl, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: json(provider),
        })
        .then(status)
        .then((response) => {
          this.eventAggregator.publish("auth:unlink", response);
          return response;
        });
    }
  }
}
