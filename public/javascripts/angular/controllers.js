app.controller('MainCtrl', [
	'$scope', '$location', 'notes', 'auth',
	function($scope, $location, notes, auth){

    //blank note object for creation of new note
    $scope.newNote = {
      'type' : 0, 
      'title' : '', 
      'body' : '', 
      'category' : 0, 
      'color' : 0, 
      'tasks' : [{
        'id' : 0, 
        'task' : ''
      }]
    };
    $scope.selectedCategory = 0;
    $scope.loading = 0;

    var init = function() {
      $scope.loading++;
      notes.getAll().success(function(data){
        angular.copy(data, notes.notes);
        $scope.notes = notes.notes;
        $scope.loading--;
      });;
      //styling for the tabs
      //TODO this should be in base.js
      $('ul.tabs').tabs();
      $('.indicator').css("background-color","#616161");
    };
    init();

    $scope.addTask = function() {
      $scope.newNote.tasks.push({'id' : $scope.newNote.tasks.length, 'task' : ''});
    };

    $scope.addTask = function(note) {
      note.taskList.push({'id' :  note.taskList.length, 'task' : ''});
    };

    $scope.deleteTask = function(task) {
      var index = $scope.newNote.tasks.indexOf(task);
      if (index > -1) {
          $scope.newNote.tasks.splice(index, 1);
      }
    };

    $scope.deleteTask = function(note, task) {
      var index = note.taskList.indexOf(task);
      if (index > -1) {
         console.log('hello')
          note.taskList.splice(index, 1);
      }
    };

    $scope.changeNoteType = function(type){
        $scope.newNote.type = type;
        if (type === 0) {
          $scope.newNote.tasks = [{'id' : 0, 'task' : ''}];
        } else {
          $scope.newNote.body = '';
        }
    };

		$scope.addNote = function(){
      $scope.newNote.category = $scope.selectedCategory;
      //check if new note is valid
      if ($scope.newNote.type === 0) {
			   if(!$scope.newNote.body || $scope.newNote.body === '' || !$scope.newNote.title || $scope.newNote.title === '') {
          return; 
        }
        $scope.newNote.tasks = [];
      } else {
        //remove empty tasks
        $scope.newNote.tasks.forEach(function(task){
            var index = $scope.newNote.tasks.indexOf(task);
            if (index > 0 && task.task === '') {
               $scope.newNote.tasks.splice(index, 1);
            }
        });
        if(($scope.newNote.tasks.length === 1 && $scope.newNote.tasks[0].task === '') || !$scope.newNote.title || $scope.newNote.title === '') {
          return; 
        }
      }
      //create node
			notes.create({
        noteType: $scope.newNote.type,
        title: $scope.newNote.title,
        body: $scope.newNote.body,
        category: $scope.newNote.category,
        color: $scope.newNote.color,
        taskList: $scope.newNote.tasks
      }).success(function(data){
        notes.notes.push(data);
      });
      //reset values
      $scope.newNote.title = '';
      $scope.newNote.body = '';
      $scope.newNote.color = 0;
      $scope.newNote.tasks = [{'id' : 0, 'task' : ''}];
      Materialize.toast('Note added!', 4000);
    };

    $scope.updateNote = function(note) {
      notes.update(note).success(function(data){
        //note is updated!
        note.date = data.date;
      })
      .error(function(data){
        //remove note from list and populate again 
        var index = notes.notes.indexOf(note);
        if (index > -1) {
          notes.notes.splice(index, 1);
        }
        notes.notes.push(data);
        Materialize.toast('Something went wrong , try again later!', 4000);
      });
    };

     $scope.edit = function(note) {
      if (!note.editing) {
        note.editing = true;
      } else {
        note.editing = false;
        $scope.updateNote(note);
      }
    };

   $scope.deleteNote = function(note) {
      notes.deleteNote(note).success(function(data){
        //note is deleted, remove from list
        var index = notes.notes.indexOf(note);
        if (index > -1) {
          notes.notes.splice(index, 1);
        }
        Materialize.toast('Note deleted!', 4000);
      }) 
      .error(function(data){
        //Something went wrong while deleting note
        Materialize.toast('Something went wrong , try again later!', 4000);
      });
    };

    $scope.getNoteClass = function(note) {
      var color = '';
      switch (note.color) {
        case 0:
          color = 'yellow lighten-3';
          break;
        case 1:
          color = 'green lighten-3';
          break;
        case 2:
          color = 'blue lighten-3';
          break;
        case 3:
          color = 'red lighten-3';
          break;
        case 4:
          color = 'indigo lighten-3';
          break;
        case 5:
          color = 'purple lighten-3';
          break;
        case 6:
          color = 'teal lighten-3';
          break;
      }
      return 'card hoverable ' + color;
    };

  }]);

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth){
    $scope.user = {};

    $scope.register = function(){
      if($scope.user.username.length < 8 || $scope.user.password.length < 8) { 
        $scope.error = { "message" : "Username and password must be longer than 8 characters"};
        return; 
      }
      if($scope.user.password !== $scope.user.passwordRepeat) { 
        $scope.error = { "message" : "Passwords do not match"};
        return; 
      }
      auth.register($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
    };

    $scope.logIn = function(){
      auth.logIn($scope.user).error(function(error){
        $scope.error = error;
      }).then(function(){
        $state.go('home');
      });
    };
  }]);

app.controller('NavCtrl', [
  '$scope',
  'auth',
  function($scope, auth){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
  }]);