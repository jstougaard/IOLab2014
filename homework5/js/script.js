var app = angular.module('main', ['ngTable', "leaflet-directive"]).
controller('EarthquakeCtrl', function($scope, $http, $filter, ngTableParams) {

    var src = 'http://io.milowski.com/usgs/earthquakes/feed/v1.0/summary/all_hour.geojson';

    $scope.features = [];

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        filter: {},
        sorting: {
            time: 'desc'     // initial sorting
        }
    }, {
        counts: [],
        total: $scope.features.length, // length of data
        getData: function($defer, params) {
            console.log("FEATURES", $scope.features);
            // use build-in angular filter
            var filteredData = params.filter() ? $filter('filter')($scope.features, params.filter()) : [];
            var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
            params.total(orderedData.length); // set total for recalc pagination
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });


    function modelFeature(obj) {
        var model = {}, key;

        var propertyKeys = ['title', 'mag', 'place', 'time', 'url', 'detail', 'sig', 'net', 'code', 'nst', 'dmin', 'rms', 'gap'];
        for (var i = 0; i < propertyKeys.length; i++) {
            key = propertyKeys[i];
            if (key in obj.properties) model[key] = obj.properties[key];
        }

        model.id = obj.id;
        model.lng = obj.geometry.coordinates[0];
        model.lat = obj.geometry.coordinates[1];

        return model;
    }

    function refreshData() {
        $http.get(src).
            success(function(data, status, headers, config) {
                console.log("SUCCESS", data,status);

                $scope.features = data.features.map(modelFeature);
                $scope.tableParams.reload();
                
            }).
            error(function(data, status, headers, config) {
              console.log("ERROR", data,status);
            });
    }

    


    /**
     * Leaflet
     * TODO: Encapsulation
     **/
    angular.extend($scope, {
        markers: {},
        magMarkers: {},
        mapCenter: {},
        selectedFeature: null,
        defaults: {
            scrollWheelZoom: false
        }
    });

    function setMapCenter(feature) {
        console.log("Map center", feature);
        if (!feature) return;
        $scope.mapCenter = {
                lat: feature.lat,
                lng: feature.lng,
                zoom: 6,
                featureId: feature.id
            };
        $scope.markers[feature.id].focus = true;
    }

    $scope.$watch("selectedFeature", setMapCenter);

    $scope.$watch("features", function() {
        var markers = {}, magMarkers={}, maxFeature;
        $scope.features.forEach(function(obj) {
            markers[obj.id] = {
                lat: obj.lat,
                lng: obj.lng,
                message: obj.title,
                focus: ($scope.selectedFeature && $scope.selectedFeature.id == obj.id),
                draggable: false
            };

            magMarkers[obj.id] = {
                type: "circle",
                radius: obj.mag * 10000, // TODO: This isn't correct
                stroke: false,
                latlngs: {
                    lat: obj.lat,
                    lng: obj.lng
                }
            };

            if (!maxFeature || maxFeature.mag < obj.mag)
                maxFeature = obj;
        });
        $scope.markers = markers;
        $scope.magMarkers = magMarkers;

        if (!$scope.selectedFeature)
            $scope.selectedFeature = maxFeature;
        
    });


    
    $scope.selectFeature = function(feature) {
        $scope.selectedFeature = feature;
    };
    $scope.refresh = refreshData;
    refreshData();
    
})

.directive('loading',   ['$http' ,function ($http) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs)
            {
                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };

                scope.$watch(scope.isLoading, function (value)
                {
                    elm.toggleClass('loading', value);
                });
            }
        };
}]);