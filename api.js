const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const ytsr = require('ytsr');

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

    const audioURL = audioFormats[0].url;

    // Convert to mp3 using ffmpeg
    const outputPath = `./temp/${Date.now()}.mp3`;
    await new Promise((resolve, reject) => {
      ffmpeg(audioURL)
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });

    // Read the converted mp3 file and send download URL
    const mp3Buffer = fs.readFileSync(outputPath);
    const mp3DataURL = `data:audio/mp3;base64,${mp3Buffer.toString('base64')}`;

    // Clean up the temporary mp3 file
    fs.unlinkSync(outputPath);

    const result = {
      title: videoInfo.videoDetails.title,
      downloadURL: mp3DataURL,
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
