var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var Note = mongoose.model('Note');

router.get('/notes', auth, function(req, res, next) {
  Note.find({'author': req.payload.username}, function(err, notes){
    if(err){ return next(err); }
    res.json(notes);
  });
});

router.post('/notes', auth, function(req, res, next) {
  var note = new Note({ 
    noteType : req.body.noteType,
    author : req.payload.username,
    title : req.body.title,
    body : req.body.body,
    taskList : req.body.taskList
  });

  note.save(function(err, note){
    if(err){ return next(err); }

    res.json(note);
  });
});

router.put('/notes', auth, function(req, res, next) {

  Note.findById(req.body._id, function(err, note) {
    if(err){ return next(err); }
    if (!note) {
      return next(new Error('Could not load Note'));
    } else {
      note.title = req.body.title;
      note.body = req.body.body;
      note.taskList = req.body.taskList;

      note.save(function(err, note) {
        if (err)
          return res.status(400).json({message: 'Something went wrong.'});
        else
          return res.json(note);
      });
    }
  });
});

router.delete('/notes', auth, function(req, res, next) {

 Note.where().findOneAndRemove(req.param.id, function(err) {
    if(err) { 
      return next(err); 
    } else {
      return res.status(200).json({message: 'Note removed.'});
    }
  });
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;
