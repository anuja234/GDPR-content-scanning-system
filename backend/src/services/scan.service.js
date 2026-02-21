const documentModel = require("../models/document.model");

const fetchScanHistory = async () => {
  return await documentModel.getAllScans();
};

module.exports = {
  fetchScanHistory
};
