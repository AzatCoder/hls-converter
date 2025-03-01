import Fastify from 'fastify';
import { exec } from 'child_process';
import fs from 'fs';
import env from './env.js';

const fastify = Fastify({
  logger: true
});

fastify.post('/', (req, rep) => {
  const { videoPath, outPath, requestUrlOnSuccess } = req.body;
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

  exec(script, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return;
    }

    console.log({ stdout, requestUrlOnSuccess });

    if (requestUrlOnSuccess) fetch(requestUrlOnSuccess);
  });

  return rep.send({ msg: 'converting started' });
});

fastify.listen({
  port: env.PORT
}, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
