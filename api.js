const express = require('express');
const ytdl = require('ytdl-core-discord');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Endpoint for downloading audio by providing YouTube video URL
app.get('/download', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing YouTube video URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const audioStream = ytdl(url, { filter: 'audioonly' });

    res.header('Content-Disposition', `attachment; filename="${info.title}.mp3"`);
    audioStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error downloading audio' });
  }
});

// Endpoint for downloading audio by providing YouTube video title
app.get('/downloadByTitle', async (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Missing YouTube video title' });
  }

  try {
    const info = await ytdl.getInfo(title);
    const audioStream = ytdl(title, { filter: 'audioonly' });

    res.header('Content-Disposition', `attachment; filename="${info.title}.mp3"`);
    audioStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error downloading audio' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
