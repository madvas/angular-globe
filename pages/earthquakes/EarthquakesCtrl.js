(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .controller('EarthquakesCtrl', EarthquakesCtrl);

  /* @ngInject */
  function EarthquakesCtrl($firebaseArray) {
    /* jshint validthis: true */
    var vm = this;
    var continents = ['europe', 'asia', 'africa', 'north_america', 'south_america', 'antartica', 'oceanic'];
    var ref = new Firebase('https://publicdata-earthquakes.firebaseio.com/by_continent/');
    var magnitudes = _.range(6, 10);
    vm.pointClicked = pointClicked;
    vm.getDate = getDate;
    activate();

    ////////////////

    function activate() {
      vm.points = _.flatten(_.map(continents, function(continent) {
        return _.map(magnitudes, function(mag) {
          return {
            values : $firebaseArray(ref.child(continent + '/' + mag))
          };
        });
      }));
    }

    function pointClicked(d) {
      vm.selected = d;
    }

    function getDate(date) {
      return new Date(date);
    }
  }
})();