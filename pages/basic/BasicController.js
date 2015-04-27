(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .controller('BasicCtrl', BasicCtrl);

  /* @ngInject */
  function BasicCtrl() {
    /* jshint validthis: true */
    var vm = this;
    activate();

    ////////////////

    function activate() {
      var randomPoints = _.map(_.range(50), function() {
        return {
          position    : {
            lat : _.random(-180, 180, true),
            lng : _.random(-180, 180, true)
          },
          pointRadius : _.random(3, 15),
          fillColor   : 'rgb(' + _.random(255) + ', ' + _.random(255) + ', ' + _.random(255) + ')'
        }
      });
      vm.points = [
        {
          values : randomPoints
        }
      ];
    }
  }
})();