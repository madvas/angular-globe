(function() {
  'use strict';

  angular
    .module('angularGlobe')
    .controller('basicCtrl', basicCtrl);

  basicCtrl.$inject = [''];

  /* @ngInject */
  function basicCtrl() {
    /* jshint validthis: true */
    var vm = this;

    vm.activate = activate;
    vm.title = 'basicCtrl';

    activate();

    ////////////////

    function activate() { }
  }
})();