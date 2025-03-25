const GOLF_API_BASE_URL = 'https://api.golfcourseapi.com/v1';
const GOLF_API_KEY = process.env.VITE_GOLF_API_KEY;

export const searchCourses = async (query) => {
  try {
    const response = await fetch(
      `${GOLF_API_BASE_URL}/search?search_query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `${GOLF_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Golf API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}
