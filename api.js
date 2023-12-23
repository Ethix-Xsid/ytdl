const express = require('express');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/download', async (req, res) => {
  const videoInput = req.query.input;

  try {
    // Check if the input is a valid YouTube video URL
    if (ytdl.validateURL(videoInput)) {
      const info = await ytdl.getInfo(videoInput);
      const format = ytdl.filterFormats(info.formats, 'audioonly')[0];

      res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp3"`);
      ytdl(videoInput, { format }).pipe(res);
    } else {
      // Assume it's a search query
      const searchResults = await yts(videoInput);
      const firstVideo = searchResults.videos[0];

      if (firstVideo) {
        const format = ytdl.filterFormats(firstVideo.url, 'audioonly')[0];

        res.header('Content-Disposition', `attachment; filename="${firstVideo.title}.mp3"`);
        ytdl(firstVideo.url, { format }).pipe(res);
      } else {
        res.status(404).send('No video found.');
      }
    }
  } catch (error) {
    res.status(500).send('Error downloading the audio.');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
