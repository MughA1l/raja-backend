import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

// Create YouTube service client
const youtube = google.youtube({
  version: 'v3',
  auth:
    process.env.YOUTUBE_API_KEY ||
    'AIzaSyBjORSaRF2NJoj5KALmFl981J3YCL8DFms',
});

async function searchYouTubeVideos(keywords) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: keywords,
      type: 'video',
      maxResults: 5,
      order: 'relevance',
    });

    return response.data.items.map((item) => ({
      title: item.snippet.title,
      url: `https://youtu.be/${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.default.url,
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
}

export default searchYouTubeVideos;
