import { config } from 'dotenv';

config();

import { cleanEnv, num } from 'envalid';

const env = cleanEnv(process.env, {
  PORT: num()
});

export default env;
