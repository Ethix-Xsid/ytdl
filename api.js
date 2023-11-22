const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/downloadurl', async (req, res) => {
  try {
    const query = req.query.query; // Search query or YouTube URL

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is missing.' });
    }

    let videoInfo;
    let audioFormats;

    if (ytdl.validateURL(query)) {
      videoInfo = await ytdl.getInfo(query);
      audioFormats = ytdl.filterFormats(videoInfo.formats, 'audio');
    } else {
      // Assume it's a search query
      const searchResults = await ytdl.search(query);
      const firstResult = searchResults.videos[0];
      videoInfo = await ytdl.getInfo(firstResult.videoId);
      audioFormats = ytdl.filterFormats(videoInfo.formats, 'audio');
    }

    const audioURL = audioFormats[0].url;

    const result = {
      title: videoInfo.videoDetails.title,
      audioURL: audioURL,
    };

    console.log('Download result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error during download:', error);
    res.status(500).json({ error: 'An error occurred during download.' });
  }
});

// Undefined routes ke liye response define karna
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
