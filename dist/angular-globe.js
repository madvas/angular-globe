(function() {
'use strict';

angular
  .module('madvas.angular-globe', [])
  .directive('m2sGlobe', m2sGlobe);

m2sGlobe.$inject = [];

/* @ngInject */
function m2sGlobe() {
  var defaultPointFill = '#8D6E63';
  var defaultLandTop = '#dadac4';
  var defaultLandBottom = '#737368';
  var defaultWater = '#FFF';
  var defaultPointStroke = '#000';
  var defaultEase = 'cubic';
  var defaultPointStrokeWidth = 0;
  var defaultPointRadius = 5;
  var defaultGlobeSize = 400;
  var defaultAnimDuration = 250;
  var globeSize;
  var svg;
  var path;
  var projection;
  var points;
  var landGroup;
  var water;
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
      points            : '=',
      mapData           : '=',
      mapType           : '@',
      size              : '&',
      pointStroke       : '&',
      pointFill         : '&',
      pointClass        : '&',
      pointId           : '&',
      pointLat          : '&',
      pointLng          : '&',
      pointRadius       : '&',
      pointStrokeWidth  : '&',
      graticule         : '&',
      draggable         : '&',
      sensitivity       : '&',
      clickable         : '&',
      pointClick        : '&',
      raisedLand        : '&',
      rotate            : '&',
      rotateSpeed       : '&',
      rotateAngle       : '&',
      enterAnimDuration : '&',
      exitAnimDuration  : '&',
      enterAnimDelay    : '&',
      exitAnimDelay     : '&',
      enterAnimEase     : '&',
      exitAnimEase      : '&'
    }
  };

  function link(_scope_, el) {
    scope = _scope_;
    raisedLand = scope.raisedLand();

    globeSize = scope.size() || el[0].clientWidth || defaultGlobeSize;
    d3.select(window).on('resize', resize.bind(null, el));

    projection = d3.geo.orthographic()
      .translate([globeSize / 2, globeSize / 2])
      .center([0, 0])
      .precision(0.5);

    svg = d3.select(el[0]).append('svg')
      .attr({
        'class' : 'm2s-globe',
        width   : globeSize,
        height  : globeSize
      });

    path = d3.geo.path()
      .projection(projection);

    projection.scale(globeSize / 2.3).clipAngle(90);

    landGroup = svg.append('g')
      .attr('class', 'm2s-globe-land-group');

    water = landGroup.append('path')
      .datum({type : 'Sphere'})
      .attr('class', 'm2s-globe-water')
      .attr('fill', defaultWater)
      .attr('d', path);

    if (scope.graticule() !== false) {
      graticule = landGroup.selectAll('path.m2s-globe-land-group')
        .data(d3.geo.graticule().lines())
        .enter().append('path')
        .attr({
          fill             : 'none',
          stroke           : defaultLandTop,
          'stroke-opacity' : 0.5,
          'class'          : 'm2s-globe-graticule'
        });
    }

    scope.$watch('mapData', mapDataChanged);
    scope.$watch('points', pointsChanged, true);
    scope.$watch('draggable', draggableChanged);
    scope.$watch('sensitivity', draggableChanged);
    scope.$watch('clickable', initClickable);
    scope.$watch('rotate', rotateChange);
    scope.$watch('rotateAngle', rotateAngleChange);
  }

  function mapDataChanged(newValue) {
    if (!newValue && mapData) {
      var type = scope.mapType || 'land';
      newValue = topojson.feature(mapData, mapData.objects[type]);
    }
    if (newValue) {
      d3.selectAll('.m2s-globe-land').remove();
      if (raisedLand !== false) {
        shadow = landGroup.append('path')
          .datum(newValue)
          .attr('class', 'm2s-globe-land m2s-globe-shadow')
          .style({
            '-webkit-filter' : 'blur(6px)',
            'filter'         : 'blur(6px)',
            'opacity'        : 0.4
          });

        landBottom = landGroup.append('path')
          .datum(newValue)
          .attr('fill', defaultLandBottom)
          .attr('class', 'm2s-globe-land m2s-globe-land-bottom');
      }

      landTop = landGroup.append('path')
        .datum(newValue)
        .attr('fill', defaultLandTop)
        .attr('class', 'm2s-globe-land m2s-globe-land-top');
      updateGlobe();
    } else {
      d3.selectAll('.m2s-globe-land').remove();
    }
  }

  function pointsChanged(newData) {
    newData = newData || [];
    var pointsData = [];
    angular.forEach(newData, function(pointGroup) {
      if (pointGroup.values && pointGroup.values.length) {
        pointsData = pointsData.concat(pointGroup.values.map(createPointFeature));
      }
    });

    points = svg.selectAll('.m2s-globe-points').data(pointsData);
    points.enter()
      .append('path')
      .attr({
        opacity : function(d, i) {
          return getTransitionDelay('enter', d, i) > 0 ? 0 : 1;
        }
      })
      .transition()
      .ease(scope.enterAnimEase() || defaultEase)
      .delay(function(d, i) {
        return getTransitionDelay('enter', d, i) || 0;
      })
      .duration(function(d, i) {
        return getTransitionDuration('enter', d, i) || defaultAnimDuration;
      })
      .attr('opacity', 1);

    points.attr({
      fill           : dataFn(scope.pointFill, defaultPointFill),
      stroke         : dataFn(scope.pointStroke, defaultPointStroke),
      'stroke-width' : dataFn(scope.pointStrokeWidth, defaultPointStrokeWidth),
    }).attr('id', function(d) {
      return d.id;
    }).attr('class', function(d) {
      return dataFn(scope.pointClass)(d) + ' m2s-globe-points';
    });

    initClickable(scope.clickable);

    points.exit()
      .transition()
      .ease(scope.exitAnimEase() || defaultEase)
      .delay(function(d, i) {
        return getTransitionDelay('exit', d, i) || 0;
      })
      .duration(function(d, i) {
        return getTransitionDuration('exit', d, i) || defaultAnimDuration;
      })
      .attr('opacity', 0)
      .remove();
    updateGlobe();
  }

  function dataFn(func, defaultVal) {
    return function(d) {
      return func({d : d.properties}) || defaultVal;
    };
  }

  function updateGlobe() {
    projection.scale(globeSize / 2.3).clipAngle(90);
    if (scope.graticule() !== false) {
      graticule.attr('d', path);
    }

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

    svg.selectAll('.m2s-globe-points').attr('d', function(d) {
      return path.pointRadius(dataFn(scope.pointRadius, defaultPointRadius)(d))(d);
    });

  }

  function createPointFeature(point) {
    return {
      type       : 'Feature',
      id         : dataFn(scope.pointId, uniqueId())({properties : point}),
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

  function getTransitionDelay(type, d, i) {
    return scope[type + 'AnimDelay']({d : d, i : i}) || 0;
  }

  function getTransitionDuration(type, d, i) {
    return scope[type + 'AnimDuration']({d : d, i : i}) || 0;
  }

  function initClickable(clickable) {
    if (clickable() === false) {
      points.style('cursor', 'normal');
      points.on('click', null);
    } else {
      points.style('cursor', 'pointer');
      points.on('click', pointClicked);
    }
  }

  function pointClicked(d) {
    var coords = [dataFn(scope.pointLng)(d), dataFn(scope.pointLat)(d)];
    var el = d3.select('#' + d.id);
    scope.$apply(function() {
      scope.pointClick({d : d.properties, c : projection(coords), el : el});
    });
  }

  function rotateChange() {
    if (scope.rotate()) {
      d3.timer(function() {
        var speed = scope.rotateSpeed() || scope.rotateSpeed() === 0 ? scope.rotateSpeed() : 1;
        projection.rotate([speed / 100 * (Date.now() - rotateStart), -15]);
        updateGlobe();
        return !scope.rotate();
      });
    }
  }

  function rotateAngleChange(newValue) {
    newValue = newValue();
    if (newValue && newValue.length === 2) {
      projection.rotate([newValue[0], newValue[1]]);
    }
  }

  function resize(el) {
    if (!scope.size()) {
      globeSize = el[0].clientWidth || defaultGlobeSize;
      svg.attr({
        width  : globeSize,
        height : globeSize
      });
      projection.translate([globeSize / 2, globeSize / 2])
        .scale(globeSize / 2.3).clipAngle(90);
      water.attr('d', path);
      updateGlobe();
    }
  }

  function uniqueId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return 'point-' + s4();
  }
}
})();