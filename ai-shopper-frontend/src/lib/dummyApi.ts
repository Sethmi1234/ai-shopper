import axios from "axios";

/**
 * Axios instance for the DummyJSON public API.
 * Used for all product, category, and search data
 * since the custom backend only handles auth, cart, orders, and wishlist.
 */
const dummyApi = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default dummyApi;
