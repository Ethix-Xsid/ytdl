const express = require('express');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const app = express();
const PORT = 3000;

app.use(express.json());

app.all('/download', async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { query, url } = req.body;

      let videoInfo;
      if (url) {
        videoInfo = await ytdl.getInfo(url);
      } else if (query) {
        const searchResults = await ytSearch(query);
        if (searchResults.videos.length === 0) {
          throw new Error('No video found with the given query.');
        }
        videoInfo = await ytdl.getInfo(searchResults.videos[0].url);
      } else {
        throw new Error('Please provide either a YouTube link or a search query.');
      }

      const audioFormat = ytdl.chooseFormat(videoInfo.formats, { filter: 'audioonly' });
      const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat });

      res.setHeader('Content-Disposition', `attachment; filename="${videoInfo.title}.mp3"`);
      audioStream.pipe(res);
    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
