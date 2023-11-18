const express = require('express');
const ytdl = require('ytdl-core');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/download', async (req, res) => {
  try {
    const url = req.query.url; // Extracting URL from query parameters
    const selectedQuality = req.query.quality; // Extracting selected quality from query parameters

    if (!url || !selectedQuality) {
      return res.status(400).json({ error: 'URL or quality parameter is missing.' });
    }

    const videoInfo = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(videoInfo.formats, 'video');

    const selectedFormat = formats.find((format, index) => (index + 1).toString() === selectedQuality);

    if (!selectedFormat) {
      return res.status(400).json({ error: 'Invalid quality parameter.' });
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
