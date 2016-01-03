var mongoose = require('mongoose');

var NotesSchema = new mongoose.Schema({
  noteType: { type: Number, default: 0 },
  author: String,
  title: String,
  body: String,
  date: { type: Date, default: Date.now },
  taskList: [{ 'id' : Number, 'task' : String, finished : { type: Boolean, default: false } }]
});

mongoose.model('Note', NotesSchema);