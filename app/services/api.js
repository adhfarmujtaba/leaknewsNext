// services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://blog.tourismofkashmir.com/apis.php';
const SITE_INFO_API_URL = 'https://blog.tourismofkashmir.com/site_info_api.php'; // Added new URL

export const fetchPosts = async (page = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?posts&page=${page}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const fetchPostBySlug = async (postSlug) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?post_slug=${postSlug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post with slug ${postSlug}:`, error);
    return null;
  }
};

export const fetchSiteInfo = async () => { // Added new function
  try {
    const response = await axios.get(SITE_INFO_API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching site info:", error);
    return null;
  }
};
