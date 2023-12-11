const express = require('express');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/downloadurl', async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is missing.' });
    }

    const isURL = ytdl.validateURL(query);

    let videoInfo;
    if (isURL) {
      videoInfo = await ytdl.getInfo(query);
    } else {
      const searchResults = await ytsr(query, { limit: 1 });
      const firstVideo = searchResults.items[0];

      if (!firstVideo || !firstVideo.url) {
        return res.status(404).json({ error: 'No search results found.' });
      }

      videoInfo = await ytdl.getInfo(firstVideo.url);
    }

    const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly');

    if (!audioFormats || audioFormats.length === 0) {
      return res.status(400).json({ error: 'No audio formats available for the video.' });
    }

    const audioURL = await convertToAudioURL(audioFormats[0].url);

    const result = {
      title: videoInfo.videoDetails.title,
      downloadURL: audioURL,
    };

    console.log('Download result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error during download:', error);
    res.status(500).json({ error: 'An error occurred during download.' });
  }
});

async function convertToAudioURL(videoURL) {
  return new Promise((resolve, reject) => {
    const outputFilename = 'temp_audio.mp3';

    ffmpeg(videoURL)
      .audioCodec('libmp3lame')
      .audioBitrate(320)
      .on('end', () => resolve(outputFilename))
      .on('error', (err) => reject(err))
      .save(outputFilename);
  });
}

// Undefined routes ke liye response define karna
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
