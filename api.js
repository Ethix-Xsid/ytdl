const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/download', async (req, res) => {
  try {
    const url = req.query.url; // URL ko query parameters se nikalna

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is missing.' });
    }

    const videoInfo = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audio');

    const uniqueQualities = [...new Set(audioFormats.map((format) => format.audioQuality))];
    const availableQualities = uniqueQualities.map((quality, index) => ({
      number: index + 1,
      quality: quality,
    }));

    const audioURL = await convertToMP3(audioFormats[0].url);

    const result = {
      title: videoInfo.videoDetails.title,
      availableQualities: availableQualities,
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

async function convertToMP3(inputURL) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputURL)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('end', () => resolve(inputURL))
      .on('error', (err) => reject(err))
      .toBuffer();
  });
}
