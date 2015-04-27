(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .controller('CoreCtrl', CoreCtrl);


  /* @ngInject */
  function CoreCtrl($state, $mdSidenav) {
    /* jshint validthis: true */
    var vm = this;
    vm.toggleSidenav = toggleSidenav;
    vm.includesState = includesState;

    ////////////////

    function includesState(stateName) {
      return $state.includes(stateName);
    }

    function toggleSidenav() {
      $mdSidenav('left').toggle();
    }

  }
})();