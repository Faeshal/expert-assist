const fs = require("fs");

const deleteFile = (filePath) => {
  if (!filePath || filePath[0] == "undefined") {
    return;
  } else {
    fs.unlink(filePath, (err) => {
      if (err) {
        throw err;
      }
    });
  }
};

exports.deleteFile = deleteFile;
