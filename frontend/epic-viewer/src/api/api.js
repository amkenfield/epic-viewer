import axios from "axios";

// does this carry over from Jobly, or do I need to rename process.env.**** ?
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class EpicViewerApi {
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const headers = {Authorization: `Bearer ${EpicViewerApi.token}`};
    const params = (method === "get") ? data : {};

    try {
      return (await axios({url, method, data, params, headers})).data;
    } catch(e) {
      console.error("API ERROR:", e.response);
      let message = e.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  /** Get the current user. */

  static async getCurrentUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  // getAuthors -- start w/this; once working, emulate for Works and Lines below

  /** Get authors (filtered by name (NB-specifically, shortName) if not undefined) */

  static async getAuthors(name) {
    let res = await this.request(`authors`, { name });
    return res.authors;
  }
 
  /** Get details on an author by id */

  static async getAuthor(id) {
    let res = await this.request(`authors/${id}`);
    return res.author;
  }
  // getWorks
  // getWork
  // getLines
  // getLine

  /** Get token for login from username, password */
  static async login(data) {
    let res = await this.request(`auth/token`, data, "post");
    return res.token;
  }

  /** Signup for site */

  static async signup(data) {
    let res = await this.request(`auth/register`, data, "post");
    return res.token;
  }

  /** Save user profile page */

  static async saveProfile(username, data) {
    let res = await ths.request(`users/${username}`, data, "patch");
    return res.user;
  }

  // to be added at some point, whether inital or future development:
  // favoriteLine
  // favoriteWork
  // favoriteAuthor
}

export default EpicViewerApi;