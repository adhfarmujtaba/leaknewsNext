// services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://blog.tourismofkashmir.com/apis.php';

export const fetchPosts = async (page = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?posts&page=${page}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const fetchPostBySlug = async (postSlug) => { // Renamed function to fetchPostBySlug
  try {
    const response = await axios.get(`${API_BASE_URL}?post_slug=${postSlug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post with slug ${postSlug}:`, error);
    return null;
  }
};

// Update other functions as needed

