const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    vendor: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
});

const Data = mongoose.model('Data', dataSchema);

module.exports = Data;
