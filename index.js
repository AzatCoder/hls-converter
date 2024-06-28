import Fastify from 'fastify';
import { exec } from 'child_process';
import fs from 'fs';
import env from './env.js';

const fastify = Fastify({
  logger: true
});

fastify.get('/', (req, rep) => {
  const { videoPath, outPath } = req.query;
  console.log({ videoPath, outPath });

  if (!videoPath || !outPath) {
    return rep.status(403).send({
      videoPath: videoPath ? undefined : 'not exists',
      outPath: outPath ? undefined : 'not exists',
    });
  }

  // validating paths
  const isVideoPathFile = fs.existsSync(videoPath) && fs.lstatSync(videoPath).isFile();
  const isOutPathDirectory = fs.existsSync(outPath) && fs.lstatSync(outPath).isDirectory();

  if (!isVideoPathFile || !isOutPathDirectory) {
    return rep.status(400).send({
      videoPath: !isVideoPathFile ? 'is not file' : undefined,
      outPath: !isOutPathDirectory ? 'is not directory' : undefined,
    });
  }

  const script = `bash create-video-hls.sh ${videoPath} ${outPath}`;

  console.log(`Executing: ${script}`);

  exec(script, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
    }
    console.log(stdout);
  });

  rep.send({ msg: 'converting started!' });
});

fastify.listen({
  port: env.PORT
}, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
