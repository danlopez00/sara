(function () {
    'use strict';

    angular.module('rocket')
            .controller('HomeController', ['$scope', 'rocketServices', 'rocketCache', 'restoCollectionsAPI', HomeController]);

    function HomeController($scope, rocketServices, rocketCache, restoCollectionsAPI) {

        /**
         * Got to product function
         * 
         * @param {string} featureId
         * @param {string} collectionName
         */
        $scope.viewProduct = function (featureId, collectionName) {
            rocketServices.go('feature', {
                collectionName: collectionName,
                featureId: featureId
            },
                    {
                        reload: true
                    });
        };

        /**
         * Search function
         */
        $scope.search = function () {
            rocketCache.remove('lastSearch');
            rocketServices.go('search', {
                q: $scope.query
            });
        };
        /**
         * Initialize 20 empty squares grid
         */
        $scope.features = [];
        for (var i = 0, ii = 20; i < ii; i++) {
            $scope.features.push({
                id: -1
            });
        }

        /*
         * Get latest acquisitions
         */
        restoCollectionsAPI.search({
            cacheName: 'latest'
        },
                function (data) {
                    $scope.features = data.features;
                },
                function (data) {
                });

        /*
         * Get collections
         */
        restoCollectionsAPI.getCollections(function (data) {
            $scope.collections = [];
            var length = data.collections.length;
            for (var i = 0; i < length; i++) {
                var item = [];
                item.name = data.collections[i]['name'];
                item.counter = data.collections[i].statistics.count;
                if (data.collections[i]['osDescription'][rocketServices.getLang()]) {
                    item.friendlyName = data.collections[i]['osDescription'][rocketServices.getLang()]['LongName'];
                    item.Description = data.collections[i]['osDescription'][rocketServices.getLang()]['Description'];
                } else {
                    item.friendlyName = data.collections[i]['osDescription']['LongName'];
                    item.Description = data.collections[i]['osDescription']['Description'];
                }
                $scope.collections.push(item);
            }
        },
                function (error) {
                });

        /*
         * Focus on search
         */
        rocketServices.focus('searchinput');

    }

})();