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
      initTabs();
      $scope.loading++;
      //get all notes from service
      notes.getAll().success(function(data){
        angular.copy(data, notes.notes);
        $scope.notes = notes.notes;
        $scope.loading--;
      });;
    };
    init();

    //Add a new task to the to-be-made note.
    $scope.addTaskToNewNote = function() {
      $scope.newNote.tasks.push({'id' : $scope.newNote.tasks.length, 'task' : ''});
    };

    //Add a new task to the note that is being edited.
    $scope.addTaskToNote = function(note) {
      note.taskList.push({'id' :  note.taskList.length, 'task' : ''});
    };

    //Delete a task from the to-be-made note.
    $scope.deleteTaskFromNewNote = function(task) {
      var index = $scope.newNote.tasks.indexOf(task);
      if (index > -1) {
          $scope.newNote.tasks.splice(index, 1);
      }
    };

    //Delete a task from the notw that is being edited.
    $scope.deleteTaskFromNote = function(note, task) {
      var index = note.taskList.indexOf(task);
      if (index > -1) {
         console.log('hello')
          note.taskList.splice(index, 1);
      }
    };

    //Change the note type of the to-be-made note.
    $scope.changeNoteType = function(type){
        $scope.newNote.type = type;
        if (type === 0) {
          //reset the tasks since the note is now a text-only note.
          $scope.newNote.tasks = [{'id' : 0, 'task' : ''}];
        } else {
          //reset the body since the note is now a checklist note.
          $scope.newNote.body = '';
        }
    };

    //Add note
		$scope.addNote = function(){
      //What note type are we creating?
      $scope.newNote.category = $scope.selectedCategory;
      //check if new note is valid for the selected category.
      if (!$scope.newNote.title || $scope.newNote.title === '') {
        showMessage('Please pick a title.');
        return; 
      }
			if($scope.newNote.type === 0 && (!$scope.newNote.body || $scope.newNote.body === '')) {
        showMessage('Please pick a body.');
        return; 
      } 
      //reset unneccesary values
      if ($scope.newNote.type === 0) {
        $scope.newNote.tasks = [];
      } else {
         $scope.newNote.body = '';
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
        //animate to added note
        scrollToTopOfNotes();
      });
      //reset values
      $scope.newNote.title = '';
      $scope.newNote.body = '';
      $scope.newNote.color = 0;
      $scope.newNote.tasks = [{'id' : 0, 'task' : ''}];
      showMessage('Note added!');
    };

    //Update a note
    $scope.updateNote = function(note) {
      notes.update(note).success(function(data){
        //note is updated, we only have to tell the view the new date
        note.date = data.date;
      })
      .error(function(data){
        //Something went wrong, the data in the view is not the same as the data in the DB anymore
        //so we remove note from list and populate again 
        var index = notes.notes.indexOf(note);
        if (index > -1) {
          notes.notes.splice(index, 1);
        }
        notes.notes.push(data);
        showMessage('Something went wrong , try again later!');
      });
    };

    //Turn on editing mode for a note
    $scope.edit = function(note) {
      note.editing = !note.editing;
      //Done editing the note, we should probably update it in the database.
      if (!note.editing && note.changed) {
        $scope.updateNote(note);
        note.changed = false;
        scrollToTopOfNotes();
      }
    };

    //Delete a note
    $scope.deleteNote = function(note) {
      notes.deleteNote(note).success(function(data){
        //note is deleted, remove from view data
        var index = notes.notes.indexOf(note);
        if (index > -1) {
          notes.notes.splice(index, 1);
        }
        Materialize.toast('Note deleted!', 4000);
      }) 
      .error(function(data){
        //Something went wrong while deleting note
        showMessage('Something went wrong , try again later!');
      });
    };

    //Get the class for the panels depending on the note color.
    $scope.getNoteClass = function(note) {
      var colors = ['yellow', 'green', 'blue', 'red', 'indigo', 'purple', 'teal'];

      return 'card ' + colors[note.color] + '  lighten-3 ' + (note.editing? ' centered' : ' hoverable');
    };

    var showMessage = function(message) {
      Materialize.toast(message, 4000);
    }

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