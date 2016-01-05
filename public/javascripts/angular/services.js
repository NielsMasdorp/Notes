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
    });
  };
  o.create = function(note) {
    return $http.post('/notes', note, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    });
  };
  o.update = function(note) {
    return $http.put('/notes', note, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    });
  };
  o.deleteNote = function(note) {
    return $http.delete('/notes/' + note._id, {
      headers: {Authorization: 'Bearer ' + auth.getToken()}
    });
  };
  return o;
}]);
