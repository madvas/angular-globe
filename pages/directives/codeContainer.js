(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .directive('codeContainer', codeContainer);

  /* @ngInject */
  function codeContainer() {
    return {
      restrict    : 'E',
      link        : link,
      templateUrl : 'pages/directives/codeContainer.html',
      scope       : {
        name : '@',
        json : '&'
      }
    };
  }

  function link(scope) {
    scope.capitalizedName = _.capitalize(scope.name);
  }
})();