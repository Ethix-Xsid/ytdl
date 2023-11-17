const express = require('express');
const ytdl = require('ytdl-core');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/download', async (req, res) => {
  try {
    const url = req.query.url; // Extracting URL from query parameters

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is missing.' });
    }

    const videoInfo = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(videoInfo.formats, 'video');

    const result = {
      title: videoInfo.videoDetails.title,
      availableQualities: formats.map(format => format.qualityLabel),
      downloadURLs: formats.map(format => ({
        quality: format.qualityLabel,
        url: format.url,
      })),
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
