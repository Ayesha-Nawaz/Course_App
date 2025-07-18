const DataUriParser = require("datauri/parser.js");
const path = require("path");

const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  console.log(extName);
  try {
    const formattedDataUri = parser.format(extName, file.buffer);
    return formattedDataUri;
  } catch (error) {
    console.error('Error formatting Data URI:', error);
    return null; // or throw the error if you want to handle it at a higher level
  }
};

module.exports = getDataUri;