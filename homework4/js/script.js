var app = angular.module('main', ['ngTable']).
controller('TableCtrl', function($scope, $http, $filter, ngTableParams) {

    var features = [];

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        filter: {},
        sorting: {
            time: 'desc'     // initial sorting
        }
    }, {
        counts: [],
        total: features.length, // length of data
        getData: function($defer, params) {
            //console.log("FEATURES", features);
            // use build-in angular filter
            var filteredData = params.filter() ? $filter('filter')(features, params.filter()) : features;
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

        model.lat = obj.geometry.coordinates[0];
        model.lng = obj.geometry.coordinates[1];

        return model;
    }

    function refreshData() {
        $http.get('http://io.milowski.com/usgs/earthquakes/feed/v1.0/summary/all_day.geojson').
            success(function(data, status, headers, config) {
                console.log("SUCCESS", data,status);

                features = data.features.map(modelFeature);
                $scope.tableParams.reload();
            }).
            error(function(data, status, headers, config) {
              console.log("ERROR", data,status);
            });
    }

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