var mongoose = require('mongoose');

var NotesSchema = new mongoose.Schema({
  noteType: { type: Number, default: 0 },
  author: String,
  title: String,
  body: String,
  category: { type: Number, default: 0 },
  color: { type: Number, default: 1 },
  date: { type: Date, default: Date.now },
  taskList: [{ 'id' : Number, 'task' : String, finished : { type: Boolean, default: false } }]
});

mongoose.model('Note', NotesSchema);