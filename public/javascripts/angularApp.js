$(".button-collapse").sideNav();

var app = angular.module('notes', ['ui.router']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        notesPromise: ['notes', function(notes){
          return notes.getAll();
        }]
      }
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
	'$scope', 'notes', 'auth',
	function($scope, notes){

		$scope.notes = notes.notes;

		$scope.addNote = function(){
      console.log('adding note: ' + $scope.body)
			if(!$scope.body || $scope.body === '') { return; }
			notes.create({
        body: $scope.body
      });
      $scope.body = '';
    };
  }]);

app.controller('AuthCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth){
    $scope.user = {};

    $scope.register = function(){
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