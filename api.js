const express = require('express');
const ytdl = require('ytdl-core');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/download', async (req, res) => {
  try {
    const url = req.query.url; // URL ko query parameters se nikalna
    const selectedQuality = req.query.quality; // Select kiye gaye quality ko query parameters se nikalna

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is missing.' });
    }

    const videoInfo = await ytdl.getInfo(url);
    const videoFormats = ytdl.filterFormats(videoInfo.formats, 'video');
    const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audio');

    if (selectedQuality) {
      const selectedFormat = videoFormats.find((format, index) => (index + 1).toString() === selectedQuality);

      if (!selectedFormat) {
        return res.status(400).json({ error: 'Invalid quality parameter.' });
      }

      const audioFormat = audioFormats.find(format => format.qualityLabel === selectedFormat.qualityLabel);
      if (!audioFormat) {
        return res.status(400).json({ error: 'Audio not available for the selected quality.' });
      }

      const result = {
        title: videoInfo.videoDetails.title,
        selectedQuality: selectedFormat.qualityLabel,
        downloadURL: selectedFormat.url,
        audioURL: audioFormat.url,
      };

      console.log('Download result:', result);
      return res.json(result);
    }

    const uniqueQualities = [...new Set(videoFormats.map((format) => format.qualityLabel))];

    const result = {
      title: videoInfo.videoDetails.title,
      availableQualities: uniqueQualities.map((quality, index) => ({
        number: index + 1,
        quality: quality,
      })),
      audioURL: audioFormats[0].url, // Pehla audio format ka URL
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
