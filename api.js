const express = require('express');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const { Readable } = require('stream');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/downloadurl', async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is missing.' });
    }

    const videoInfo = await getVideoInfo(query);

    if (!videoInfo) {
      return res.status(404).json({ error: 'No search results found.' });
    }

    const audioURL = await getAudioDownloadURL(videoInfo.url);
    const convertedAudioBuffer = await convertAudio(audioURL);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${videoInfo.title}.mp3"`);
    res.end(convertedAudioBuffer);
  } catch (error) {
    console.error('Error during download:', error);
    res.status(500).json({ error: 'An error occurred during download.' });
  }
});

async function getVideoInfo(query) {
  const searchResults = await ytsr(query, { limit: 1 });

  if (!searchResults.items || searchResults.items.length === 0) {
    return null;
  }

  const firstVideo = searchResults.items[0];
  return {
    title: firstVideo.title,
    url: firstVideo.url,
  };
}

async function getAudioDownloadURL(videoURL) {
  const audioInfo = await ytdl.getInfo(videoURL);
  const audioFormats = ytdl.filterFormats(audioInfo.formats, 'audioonly');

  if (!audioFormats || audioFormats.length === 0) {
    throw new Error('No audio formats available for the video.');
  }

  const audioURL = audioFormats[0].url;
  return audioURL;
}

async function convertAudio(audioURL) {
  return new Promise((resolve, reject) => {
    const audioStream = ytdl(audioURL, { quality: 'highestaudio' })
      .on('error', (err) => reject(err));

    const ffmpegCommand = ffmpeg()
      .input(audioStream)
      .audioCodec('libmp3lame')
      .toFormat('mp3')
      .on('error', (err) => reject(err));

    ffmpegCommand.toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}

// Undefined routes ke liye response define karna
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
