(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .controller('CoreCtrl', CoreCtrl);


  /* @ngInject */
  function CoreCtrl($http, $interval, $firebaseArray) {
    /* jshint validthis: true */
    var vm = this;
    const CONTINENTS = ["europe", "asia", "africa", "north_america", "south_america", "antartica", "oceanic"];
    var ref = new Firebase('https://publicdata-earthquakes.firebaseio.com/by_continent/');

    vm.activate = activate;
    vm.title = 'CoreCtrl';
    vm.pointClicked = pointClicked;
    vm.data = [];
    activate();

    ////////////////

    function activate() {
      console.log('coreCtrl');
      vm.data = _.flatten(_.map(CONTINENTS, function(continent) {
        return _.map(_.range(6, 10), function(mag) {
          return {
            name   : continent,
            values : $firebaseArray(ref.child(continent + '/' + mag))
          };
        });
      }));

      //$interval(function() {
      //  vm.data = generateData();
      //}, 1000);
      $http.get('pages/resources/world-110m.json').then(function(res) {
        vm.landData = topojson.feature(res.data, res.data.objects.land);
        //vm.landData = topojson.feature(res.data, res.data.objects.countries);
      })
    }

    function pointClicked(d) {
      console.log('point was clicked');
      console.log(d.category);
    }

    function generateData() {
      if (!vm.data) {
        return _.map(_.range(_.random(20, 40)), function() {
          return {
            id          : 1,
            category    : ['cat1', 'cat2', 'cat3'][_.random(2)],
            position    : {
              latitude  : _.random(-180, 180, true),
              longitude : _.random(-180, 180, true)
            },
            pointRadius : _.random(3, 15),
            stroke      : 'rgb(' + _.random(255) + ', ' + _.random(255) + ', ' + _.random(255) + ')'
          }
        });
      } else {
        vm.data = [];
      }
    }
  }
})();