var mongoose = require('mongoose');

var NotesSchema = new mongoose.Schema({
  author: String,
  title: String,
  body: String,
  color: { type: String, default: 'green' },
  date: { type: Date, default: Date.now }
});

mongoose.model('Note', NotesSchema);