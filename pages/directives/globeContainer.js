(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .directive('globeContainer', globeContainer);

  /* @ngInject */
  function globeContainer() {
    return {
      restrict    : 'E',
      transclude  : true,
      templateUrl : '/pages/directives/globeContainer.html'
    };
  }
})();