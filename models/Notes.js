var mongoose = require('mongoose');

var NotesSchema = new mongoose.Schema({
  author: String,
  body: String
});

mongoose.model('Note', NotesSchema);