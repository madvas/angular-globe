(function(angular) {
  'use strict';

  angular
    .module('angularGlobeDemo', [
      'ui.router',
      'ngMaterial',
      'madvas.angular-globe',
      'firebase',
      'hljs',
      'multi-transclude',
      'angulartics',
      'angulartics.google.analytics'
    ])
    .config(configureApp);

  function configureApp($stateProvider, $urlRouterProvider) {
    var staticPath ='/angular-globe/pages';

    $stateProvider
      .state('basic', {
        url         : '/basic',
        templateUrl : staticPath + '/basic/basic.html'
      })
      .state('advanced', {
        url         : '/advanced',
        templateUrl : staticPath + '/advanced/advanced.html'
      })
      .state('expert', {
        url         : '/expert',
        templateUrl : staticPath + '/expert/expert.html'
      })
      .state('earthquakes', {
        url         : '/earthquakes',
        templateUrl : staticPath + '/earthquakes/earthquakes.html'
      })
      .state('api', {
        url         : '/api',
        templateUrl : staticPath + '/api/api.html'
      });

    $urlRouterProvider.otherwise('/basic');

  }

}(angular));
