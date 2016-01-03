var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
  finished: { type: Boolean, default: false },
  body: String,
  note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' }
});

mongoose.model('Task', TaskSchema);