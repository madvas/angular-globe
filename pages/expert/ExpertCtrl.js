(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .controller('ExpertCtrl', ExpertCtrl);

  /* @ngInject */
  function ExpertCtrl($http, $interval) {
    /* jshint validthis: true */
    var vm = this;
    vm.pointClicked = pointClicked;
    vm.selected = {a : 'gasd'};
    activate();

    ////////////////

    function activate() {
      $interval(function() {
        if (!vm.points) {
          return;
        }
        _.each(vm.points[0].values, function(city) {
          city.cityColor = getRandomColor();
        });
      }, 500);
      /**
       * You can load custom GeoJSON data as map into globe
       * If you have data in topojson, you have to convert it to GeoJSON like this:
       */
      $http.get('angular-globe/pages/core/resources/us.json').then(function(res) {
        vm.mapData = topojson.feature(res.data, res.data.objects.land);
      });
      $http.get('angular-globe/pages/expert/expert.json').then(function(res) {
        vm.points = [
          {
            values : res.data
          }
        ];
      });
    }

    function getRandomColor() {
      return 'rgb(' + _.random(255) + ', ' + _.random(255) + ', ' + _.random(255) + ')';
    }

    function pointClicked(city) {
      vm.selected = city;
    }
  }
})();