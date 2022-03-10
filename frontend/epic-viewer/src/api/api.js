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

  // getAuthors
  // getAuthor
  // getWorks
  // getWork
  // getLines
  // getLine
  // login
  // signup
  // saveProfile

  // to be added at some point, whether inital or future development:
  // favoriteLine
  // favoriteWork
  // favoriteAuthor
}

export default EpicViewerApi;