const express = require('express');
const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/download', async (req, res) => {
  try {
    const query = req.query.song;

    if (!query) {
      return res.status(400).json({ error: 'Song query parameter is missing.' });
    }

    const isLink = ytdl.validateURL(query);
    const videoId = isLink ? ytdl.getURLVideoID(query) : await ytSearch(query).then(results => results.videos[0].videoId);

    const info = await ytdl.getBasicInfo(videoId);
    const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
    
    if (!audioFormat) {
      return res.status(404).json({ error: 'Audio format not available for the given video.' });
    }

    const downloadUrl = audioFormat.url;

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
