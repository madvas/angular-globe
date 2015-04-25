(function() {
  'use strict';

  angular
    .module('madvas.angular-globe', [])
    .directive('m2sGlobe', m2sGlobe);

  m2sGlobe.$inject = [];

  /* @ngInject */
  function m2sGlobe() {
    var defaultPointFill = '#8D6E63';
    var defaultPointStroke = '#000';
    var defaultPointStrokeWidth = 1;
    var defaultPointRadius = 5;
    var defaultGlobeSize = 400;
    var globeSize;
    var svg;
    var path;
    var projection;
    var points;
    var landGroup;
    var graticule;
    var shadow;
    var landBottom;
    var landTop;
    var scope;
    var raisedLand;
    var rotateStart = new Date();

    return {
      link     : link,
      restrict : 'EA',
      scope    : {
        points           : '=',
        land             : '=',
        size             : '&',
        pointStroke      : '&',
        pointFill        : '&',
        pointClass       : '&',
        pointId          : '&',
        pointLat         : '&',
        pointLng         : '&',
        pointRadius      : '&',
        pointStrokeWidth : '&',
        draggable        : '&',
        sensitivity      : '&',
        clickable        : '&',
        pointClick       : '&',
        raisedLand       : '&',
        rotate           : '&',
        rotateSpeed      : '&'
      }
    };

    function link(_scope_, el, attrs) {
      scope = _scope_;
      raisedLand = scope.raisedLand();
      console.log(el[0].clientWidth);

      globeSize = scope.size() || el[0].clientWidth || defaultGlobeSize;
      d3.select(window).on('resize', resize.bind(null, el));

      projection = d3.geo.orthographic()
        .translate([globeSize / 2, globeSize / 2])
        .precision(.5);

      svg = d3.select(el[0]).append('svg')
        .attr({
          'class' : 'm2s-globe',
          width   : globeSize,
          height  : globeSize
        });

      console.log(svg.attr('width'));

      path = d3.geo.path()
        .projection(projection);

      projection.scale(globeSize / 2.3).clipAngle(90);

      landGroup = svg.append('g')
        .attr('class', 'm2s-globe-land-group');

      landGroup.append('path')
        .datum({type : 'Sphere'})
        .attr('class', 'm2s-globe-water')
        .attr('d', path);

      graticule = landGroup.selectAll('path.m2s-globe-land-group')
        .data(d3.geo.graticule().lines())
        .enter().append('path')
        .attr('class', 'm2s-globe-graticule');

      scope.$watch('land', landChanged);
      scope.$watch('points', pointsChanged, true);
      scope.$watch('draggable', draggableChanged);
      scope.$watch('sensitivity', draggableChanged);
      scope.$watch('clickable', clickableChanged);
      scope.$watch('rotate', rotateChange);
    }

    function landChanged(newLand) {
      if (newLand) {
        if (raisedLand !== false) {
          shadow = landGroup.append('path')
            .datum(newLand)
            .attr('class', 'm2s-globe-land m2s-globe-shadow')
            .style({
              '-webkit-filter' : 'blur(6px)',
              'filter'         : 'blur(6px)',
              'opacity'        : 0.4
            });

          landBottom = landGroup.append('path')
            .datum(newLand)
            .attr('class', 'm2s-globe-land m2s-globe-land-bottom');
        }

        landTop = landGroup.append('path')
          .datum(newLand)
          .attr('class', 'm2s-globe-land m2s-globe-land-top');
        updateGlobe();
      } else {
        d3.selectAll('.m2s-globe-land').remove();
      }
    }

    function pointsChanged(newData) {
      newData = newData || [];
      newData = newData.map(createPointFeature);

      points = svg.selectAll('.m2s-globe-points').data(newData);
      points.enter()
        .append('path')
        //.append('circle')
        //.attr('r', dataFunc(scope.pointRadius, 5))
        .attr({
          fill           : dataFn(scope.pointFill, defaultPointFill),
          stroke         : dataFn(scope.pointStroke, defaultPointStroke),
          'stroke-width' : dataFn(scope.pointStrokeWidth, defaultPointStrokeWidth)
        })
        .attr('class', function(d) {
          return dataFn(scope.pointClass)(d) + ' m2s-globe-points';
        });

      points.exit().remove();
    }

    function dataFn(func, defaultVal) {
      return function(d) {
        return func({d : d.properties}) || defaultVal;
      }
    }

    function updateGlobe() {
      projection.scale(globeSize / 2.3).clipAngle(90);
      graticule.attr('d', path);

      if (raisedLand !== false) {
        if (shadow) {
          shadow.attr('d', path);
        }

        projection.scale(globeSize / 2.2).clipAngle(106.3);
        if (landBottom) {
          landBottom.attr('d', path);
        }

        projection.scale(globeSize / 2.2).clipAngle(90);
      }

      if (landTop) {
        landTop.attr('d', path);
      }

      if (points) {
        points.attr('d', function(d) {
          return path.pointRadius(dataFn(
            scope.pointRadius, defaultPointRadius)(d))(d);
        });
      }


      //points.attr('transform', function(d) {
      //  var geoangle = d3.geo.distance(
      //    [dataFunc(scope.pointLng)(d), dataFunc(scope.pointLat)(d)],
      //    [
      //      -projection.rotate()[0],
      //      projection.rotate()[1]
      //    ]);
      //
      //  if (geoangle > 1.57079632679490) {
      //    return 'translate(-9999, -9999)';
      //  }
      //
      //  return 'translate(' + projection([
      //      dataFunc(scope.pointLng)(d),
      //      dataFunc(scope.pointLat)(d)
      //    ]) + ')';
      //
      //});
    }

    function createPointFeature(point) {
      return {
        type       : 'Feature',
        id         : scope.pointId() || '',
        properties : point,
        geometry   : {
          type        : 'Point',
          coordinates : [
            dataFn(scope.pointLng)({properties : point}),
            dataFn(scope.pointLat)({properties : point})
          ]
        }
      };
    }

    function draggableChanged() {
      var draggable = scope.draggable();
      var sens = scope.sensitivity() || 0.25;

      if (draggable) {
        landGroup.call(d3.behavior.drag()
          .origin(function() {
            var r = projection.rotate();
            return {x : r[0] / sens, y : -r[1] / sens};
          })
          .on('drag', function() {
            var rotate = projection.rotate();
            projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
            updateGlobe();
          }));
      } else {
        landGroup.on('dragstart', null)
          .on('drag', null)
          .on('dragend', null);
      }
    }

    function clickableChanged(clickable) {
      if (clickable() === false) {
        points.style('cursor', 'normal');
        points.on('click', null);
      } else {
        points.style('cursor', 'pointer');
        points.on('click', function(d) {
          dataFn(scope.pointClick)(d);
        })
      }
    }

    function rotateChange() {
      if (scope.rotate()) {
        d3.timer(function() {
          var speed = scope.rotateSpeed() || 1;
          projection.rotate([speed / 100 * (Date.now() - rotateStart), -15]);
          updateGlobe();
          return !scope.rotate();
        });
      }
    }

    function resize(el) {
      if (!scope.size()) {
        var size = el[0].clientWidth || defaultGlobeSize;
        console.log(size);
        svg.attr({
          width  : size,
          height : size
        });
        landGroup.attr({
          width  : size,
          height : size
        });
        landTop.attr({
          width  : size,
          height : size
        });
        svg.selectAll('path').attr({
          width  : size,
          height : size
        });
        projection.translate([size / 2, size / 2]);
      }
    }
  }
})();