const express = require('express');
const ytdl = require('ytdl-core-discord');
const ytsr = require('ytsr');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/download', async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is missing.' });
    }

    const isURL = ytdl.validateURL(query);

    if (isURL) {
      const audioReadableStream = await ytdl(query, { filter: 'audioonly', quality: 'highestaudio' });
      res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
      audioReadableStream.pipe(res);
    } else {
      const searchResults = await ytsr(query, { limit: 1 });
      const firstVideo = searchResults.items[0];

      if (!firstVideo || !firstVideo.url) {
        return res.status(404).json({ error: 'No search results found.' });
      }

      const audioReadableStream = await ytdl(firstVideo.url, { filter: 'audioonly', quality: 'highestaudio' });
      res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
      audioReadableStream.pipe(res);
    }
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
