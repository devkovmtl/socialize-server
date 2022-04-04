const {
  NODE_ENV,
  MONGO_USERNAME = 'admin',
  MONGO_PASSWORD = 'secret',
  MONGO_HOST = 'localhost',
  MONGO_PORT = 27017,
  MONGO_DATABASE = 'social',
  MONGO_DATABASE_DEV = 'social_dev',
} = process.env;

const DATABASE =
  NODE_ENV === 'production' ? MONGO_DATABASE : MONGO_DATABASE_DEV;

exports.MONGO_URI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}/${DATABASE}?retryWrites=true&w=majority`;

exports.MONGO_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
