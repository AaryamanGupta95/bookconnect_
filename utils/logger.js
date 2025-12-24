const fs = require('fs').promises;
module.exports = {
  async logError(err) {
    const text = `${new Date().toISOString()} - ${err.stack || err}\n`;
    await fs.appendFile('error.log', text);
  }
};
