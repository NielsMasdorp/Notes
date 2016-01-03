var app = angular.module('notes', ['ui.router', 'angularMoment']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      //TODO: fix this
      // resolve: {
      //   notesPromise: ['notes', function(notes){
      //     return notes.getAll();
      //   }]
      // },
      onEnter: ['$state', 'auth', function($state, auth){
        if(!auth.isLoggedIn()){
          $state.go('login');
        }
      }]
    })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });

    $urlRouterProvider.otherwise('home');
  }]);

app.factory('auth', ['$http', '$window', function($http, $window){
  var auth = {};

  auth.saveToken = function (token){
    $window.localStorage['notes-token'] = token;
  };

  auth.getToken = function (){
    return $window.localStorage['notes-token'];
  }

  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logIn = function(user){
    console.log('login factory');
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logOut = function(){
    $window.localStorage.removeItem('notes-token');
    //back to login
    $window.location.replace('/#/login');
  };

  return auth;
}]);

app.factory('notes', ['$http', 'auth', function($http, auth){
  var o = {
    notes: []
  };
  o.getAll = function() {
    return $http.get('/notes', {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).success(function(data){
      angular.copy(data, o.notes);
    });
  };
  o.create = function(note) {
    return $http.post('/notes', note, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    }).success(function(data){
      o.notes.push(data);
    });
  };
  return o;
}]);

app.controller('MainCtrl', [
	'$scope', '$location', 'notes', 'auth',
	function($scope, $location, notes, auth){

    $scope.newNote = {'type' : 0, 'title' : '', 'body' : '', 'tasks' : [{'id' : 0, 'task' : ''}]};

    var init = function() {
      //TODO: fix better way to retrieve notes
      notes.getAll();
      $scope.notes = notes.notes;
      //styling for the tabs
      $('ul.tabs').tabs();
      $('.indicator').css("background-color","#9E9E9E");
    };
    init();

    $scope.addTask = function() {
      $scope.newNote.tasks.push({'id' : $scope.newNote.tasks.length, 'task' : ''});
    };

    $scope.deleteTask = function(task) {
      var index = $scope.newNote.tasks.indexOf(task);
      if (index > -1) {
          $scope.newNote.tasks.splice(index, 1);
      }
    };

    $scope.changeNoteType = function(type){
        $scope.newNote.type = type;
        if (type === 0) {
          $scope.newNote.tasks = [{'id' : 0, 'task' : ''}];
        } else {
          $scope.newNote.title = '';
          $scope.newNote.body = '';
        }
    };

		$scope.addNote = function(){
      //check if new note is valid
      if ($scope.newNote.type === 0) {
			   if(!$scope.newNote.body || $scope.newNote.body === '' || !$scope.newNote.title || $scope.newNote.title === '') {
          return; 
        }
        $scope.newNote.tasks = [];
      } else {
        if(($scope.newNote.tasks.length === 1 && $scope.newNote.tasks[0].task === '') || !$scope.newNote.title || $scope.newNote.title === '') {
          return; 
        }
      }
      //create node
			notes.create({
        noteType: $scope.newNote.type,
        title: $scope.newNote.title,
        body: $scope.newNote.body,
        taskList: $scope.newNote.tasks
      });
      //reset values
      $scope.newNote.title = '';
      $scope.newNote.body = '';
      $scope.newNote.tasks = [{'id' : 0, 'task' : ''}];
      Materialize.toast('Note added!', 4000);
    };
  }]);

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth){
    $scope.user = {};

    $scope.register = function(){
      if(!$scope.user.username.length < 8 || $scope.user.password.length < 8) { 
        $scope.error = { "message" : "Username and password must be longer than 8 characters"};
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