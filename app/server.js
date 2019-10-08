const dotenv = require('dotenv');
require('app-module-path').addPath(`${__dirname}`);
require('./logger');

const app = require('./app');


dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
    logger.info(`Application server started at http://localhost:${port}`);
});
