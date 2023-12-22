const express = require('express');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function getAudioUrl(videoId) {
  const info = await ytdl.getInfo(videoId);
  const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
  return audioFormat.url;
}

app.get('/download', async (req, res) => {
  try {
    const query = req.query.song;

    if (!query) {
      return res.status(400).json({ error: 'Song query parameter is missing.' });
    }

    const isLink = ytdl.validateURL(query);
    const videoId = isLink ? ytdl.getURLVideoID(query) : await ytSearch(query).then(results => results.videos[0].videoId);

    const downloadUrl = await getAudioUrl(videoId);

    // Format duration into hours, minutes, and seconds
    const durationHours = Math.floor(videoInfo.videoDetails.lengthSeconds / 3600);
    const durationMinutes = Math.floor((videoInfo.videoDetails.lengthSeconds % 3600) / 60);
    const durationSeconds = videoInfo.videoDetails.lengthSeconds % 60;

    const result = {
      title: videoInfo.videoDetails.title,
      views: videoInfo.videoDetails.viewCount,
      youtubeUrl: isLink ? query : videoInfo.videoDetails.video_url,
      downloadUrl: downloadUrl,  // Direct audio download URL
      uploadDate: new Date(videoInfo.videoDetails.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      uploadChannel: videoInfo.videoDetails.author.name,
      duration: `${durationHours}h ${durationMinutes}m ${durationSeconds}s`,
      size: audioFormat.contentLength ? formatBytes(parseInt(audioFormat.contentLength)) : 'Unknown',
      thumbnail: videoInfo.videoDetails.thumbnail.thumbnails[0].url,
      likes: videoInfo.videoDetails.likes || 0,
      dislikes: videoInfo.videoDetails.dislikes || 0,
    };

    console.log('Download result:', result);

    // Respond with JSON including the download URL for MP3
    res.json({ downloadUrl: result.downloadUrl });
  } catch (error) {
    console.error('Error during download:', error);
    res.status(500).json({ error: 'An error occurred during download.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
