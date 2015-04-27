(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .controller('AdvancedCtrl', AdvancedCtrl);

  /* @ngInject */
  function AdvancedCtrl() {
    /* jshint validthis: true */
    var vm = this;
    vm.speed = 2;
    vm.getPointClass = getPointClass;
    vm.getPointRadius = getPointRadius;
    activate();

    ////////////////

    function activate() {
      var randomPoints = _.map(_.range(30), function() {
        return {
          myId       : 'ultraId-' + _.uniqueId(),
          myPosition : {
            lat : _.random(-180, 180, true),
            lng : _.random(-180, 180, true)
          },
          myCategory : ['nicePlaces', 'uglyPlaces', 'aliens'][_.random(2)]
        };
      });
      vm.points = [
        {
          values : randomPoints
        }
      ];
    }

    function getPointRadius(d) {
      return d.myCategory.length;
    }

    function getPointClass(d) {
      return d.myCategory;
    }
  }
})();