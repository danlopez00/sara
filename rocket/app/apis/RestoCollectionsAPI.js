(function () {

    'use strict';

    angular.module('rocket')
            .factory('restoCollectionsAPI', ['$http', 'rocketServices', 'rocketCache', restoCollectionsAPI]);

    function restoCollectionsAPI($http, rocketServices, rocketCache) {

        var api = {
            getCollections:getCollections,
            getFeature:getFeature,
            search: search,
	    	canVisualize: canVisualize
        };
        
        return api;

        ////////////
        
        /**
         * 
         * Search in all collections
         * 
         * GET /api/collections/search
         * 
         * @param {array} params
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function search(params, callback, error) {
            
            /*
             * First get feature from cache
             */
            if (params.cacheName) {
                var cache = rocketCache.get(params.cacheName);
                if (cache) {
                    for (var i = cache.features.length; i--; ) {
                        if (cache.features[i].id === params.featureId) {
                            callback(cache.features[i]);
                            return;
                        }
                    }
                }
            }
            
            /*
             * Clean params
             */
            var searchParams = {
                q: params['q'] || '',
                page: params['page'] || 1,
                lang: rocketServices.getLang()
            };
            for (var key in params) {
                if (key !== 'view' && key !== 'collection' && typeof params[key] !== 'undefined') {
                    searchParams[key] = params[key];
                }
            }
            $http({
                url:rocketServices.restoEndPoint() + '/api/collections' + (params['collection'] ? '/' + params['collection'] : '') + '/search.json',
                method:'GET',
                params:searchParams
            }).
            success(function (result) {
                
                /*
                 * Rewrite features geometry to avoid awkward drawing
                 * when crossing the -180/+180 meridian
                 */
                for (var i = 0, ii = result.features.length; i < ii; i++) {
                    if (result.features[i].geometry){
                        result.features[i].geometry = correctWrapDateLine(result.features[i].geometry);
                    }
                }
                callback(result);
                
            }).
            error(function (result) {
                error(result);
            });
        }

        /**
         * 
         * Return feature 
         * 
         * GET /collections/:collectionName/:featureId
         * 
         * @param {Object} params
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getFeature(params, callback, error) {
            
            /*
             * Invalid route
             */
            if (!params.collectionName || !params.featureId) {
                return error();
            }
            
            /*
             * First get feature from cache
             */
            var cache = rocketCache.get('lastSearch');
            if (cache) {
                for (var i = cache.features.length; i--; ) {
                    if (cache.features[i].id === params.featureId) {
                        callback(cache.features[i]);
                        return;
                    }
                }
            }
            $http({
                url:rocketServices.restoEndPoint() + '/collections/' + params.collectionName + '/' + params.featureId + '.json',
                method:'GET',
                params:{
                    lang: params.lang || rocketServices.getLang()
                }
            }).
            success(function (result) {
                
                /*
                 * Rewrite feature geometry to avoid awkward drawing
                 * when crossing the -180/+180 meridian
                 */
                if (result.geometry) {
                    result.geometry = correctWrapDateLine(result.geometry);
                }
                
                callback(result);
                
            }).
            error(function (result) {
                error(result);
            });
        }
        
        /**
         * 
         * Return collections
         * 
         * GET /collections
         * 
         * @param {function} callback
         * @param {function} error
         * @returns {undefined}
         */
        function getCollections(callback, error) {
            
            /*
             * First get feature from cache
             */
            var cache = rocketCache.get('collections');
            if (cache) {
                callback(cache);
            }
            else {
                $http({
                    url:rocketServices.restoEndPoint() + '/collections.json',
                    method:'GET'
                }).
                success(function (result) {
                    rocketCache.put('collections', result);
                    callback(result);
                }).
                error(function (result) {
                    error(result);
                });
            }
        }
        
		/**
	 	* Check if user can visualize 
	 	*
	 	*/
        function canVisualize(feature,successCallback,errorCallback) {
            $http({
                url:rocketServices.restoEndPoint() + '/collections/' + feature.properties.collection  + '/' + feature.id,
                method:'GET'
            }).
            success(function (result) {
		successCallback();
            }).
            error(function (result) {
		errorCallback();
            });
        }

       /**
        * Correct input polygon WKT from -180/180 crossing problem
        * 
        * @param {array} geometry
        */
        function correctWrapDateLine(geometry) {
            
            var add360, lonPrev, latPrev, lon;
            
            /*
             * Multipolygon case
             */
            for (var i = 0, ii = geometry['coordinates'].length; i < ii; i++) {
                
                add360 = false;
                lonPrev = geometry['coordinates'][i][0][0];
                latPrev = geometry['coordinates'][i][0][1];

                /*
                 * If Delta(lon(i) - lon(i - 1)) is greater than 180 degrees then add 360 to lon
                 */
                for (var j = 1, jj = geometry['coordinates'][i].length; j < jj; j++) {
                    lon = geometry['coordinates'][i][j][0];
                    if (lon - lonPrev >= 180) {
                        lon = lon - 360;
                        add360 = true;
                    } 
                    else if (lon - lonPrev <= -180) {
                        lon = lon + 360;
                        add360 = true;
                    }
                    lonPrev = lon;
                    latPrev = geometry['coordinates'][i][j][1];
                    geometry['coordinates'][i][j] = [lon, geometry['coordinates'][i][j][1]];
                }
                
                if (add360) {
                    for (var j = 0, jj = geometry['coordinates'][i].length; j < jj; j++) {
                        geometry['coordinates'][i][j] = [geometry['coordinates'][i][j][0] + 360, geometry['coordinates'][i][j][1]];
                    }
                }
            }
            
            return geometry;
        }
    }

})();
