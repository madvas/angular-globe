(function() {
  'use strict';

  angular
    .module('angularGlobeDemo')
    .controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = ['$http'];

  /* @ngInject */
  function HomeCtrl($http) {
    /* jshint validthis: true */
    var vm = this;

    vm.activate = activate;
    vm.title = 'HomeCtrl';
    vm.pointClicked = pointClicked;
    vm.data = _.map(_.range(35), function() {
      return {
        id       : 1,
        category : ['cat1', 'cat2', 'cat3'][_.random(2)],
        position : {
          latitude  : _.random(-180, 180, true),
          longitude : _.random(-180, 180, true)
        },
        pointRadius : _.random(3, 15),
        stroke : 'rgb(' + _.random(255) + ', ' + _.random(255) + ', ' + _.random(255) + ')'
      }
    });
    activate();

    ////////////////

    function activate() {
      $http.get('pages/resources/world-110m.json').then(function(res) {
        vm.landData = topojson.feature(res.data, res.data.objects.land);
        //vm.landData = topojson.feature(res.data, res.data.objects.countries);
      })
    }

    function pointClicked(d) {
      console.log('point was clicked');
      console.log(d.category);
    }
  }
})();