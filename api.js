const express = require('express');
const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search');

const app = express();
const port = 3000;

app.use(express.json());

const youtubeSearchOptions = {
  maxResults: 1,
  key: 'AIzaSyD1Xa6Ohi-eig2lA7oc40HXIDiZqTyd854', // Replace with your YouTube API key
};

app.get('/download', async (req, res) => {
  try {
    const url = req.query.url;
    const title = req.query.title;

    if (!url && !title) {
      return res.status(400).json({ error: 'URL or title parameter is missing.' });
    }

    let videoInfo;

    if (url) {
      videoInfo = await ytdl.getInfo(url);
    } else {
      // Search for the video based on title
      const searchResults = await youtubeSearch(title, youtubeSearchOptions);
      if (!searchResults || searchResults.length === 0) {
        return res.status(404).json({ error: 'Video not found based on the provided title.' });
      }

      const firstResult = searchResults[0];
      videoInfo = await ytdl.getInfo(firstResult.link);
    }

    // Rest of the code remains unchanged

    const quality = req.query.quality || 'highest';
    const type = req.query.type || 'video';

    const formats = ytdl.filterFormats(videoInfo.formats, type);

    const selectedFormat = formats.find(format => format.qualityLabel === quality);

    if (!selectedFormat) {
      return res.status(400).json({ error: 'Requested quality not available.' });
    }

    const result = {
      title: videoInfo.videoDetails.title,
      selectedQuality: selectedFormat.qualityLabel,
      downloadURL: selectedFormat.url,
    };

    console.log('Download result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error during download:', error);
    res.status(500).json({ error: 'An error occurred during download.' });
  }
});

// Define a response for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
