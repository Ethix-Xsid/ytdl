const express = require('express');
const ytdl = require('ytdl-core-discord');
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

app.get('/download', async (req, res) => {
  try {
    const query = req.query.song;

    if (!query) {
      return res.status(400).json({ error: 'Song query parameter is missing.' });
    }

    const isLink = ytdl.validateURL(query);
    const videoId = isLink ? ytdl.getURLVideoID(query) : await ytSearch(query).then(results => results.videos[0].videoId);

    const downloadUrl = await ytdl.getBasicInfo(videoId).then(info => {
      const audioFormat = ytdl.chooseFormat(info.formats.filter(format => format.mimeType.includes('audio')), { quality: 'highestaudio' });
      return audioFormat.url;
    });

    const result = {
      downloadUrl: downloadUrl,  // Direct audio download URL
    };

    console.log('Download result:', result);

    // Respond with JSON including the download URL for MP3
    res.json(result);
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
