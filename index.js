'use strict';

var querystring = require('querystring');

var Promise = require('native-promise-only');
var RoutePattern = require('route-pattern');
var request = require('request');

var token = '26c4202eb475d02864b40827dfff11a14657aa41';

var routes = {
  'packages/search.json?query=:query&limit=:limit': function (options) {
    var packagesSearchUrl = 'https://www.assetstore.unity3d.com/api/en-US/search/xplr/search.json?';

    return fetchRessource(packagesSearchUrl, options.queryParams);
  },

  'packages/:id': function (options) {
    var packageOverviewUrl = 'https://www.assetstore.unity3d.com/api/en-US/content/overview/:id.json?';

    return fetchRessourceById(packageOverviewUrl, options);
  },

  'packages/:id/assets': function (options) {
    var formatedPackageUrl = 'packages/:id'
      .replace(':id', options.namedParams.id);

    return api.get(formatedPackageUrl, options.queryParams).then(function (res, err) {
      var formatedPackageAssetsUrl = formatedPackageUrl + '/assets/:version'
        .replace(':version', res.content.package_version_id);

      return api.get(formatedPackageAssetsUrl, options.queryParams);
    });
  },

  'packages/:id/assets/:version': function (options) {
    var packageAssetsUrl = 'https://www.assetstore.unity3d.com/api/en-US/content/assets/:id/:version.json?';
    var formatedPackageAssetsUrl = packageAssetsUrl
        .replace(':id', options.namedParams.id)
        .replace(':version', options.namedParams.version);

    return fetchRessource(formatedPackageAssetsUrl, options.queryParams);
  },

  'categories': function (options) {
    var categoriesUrl = 'https://www.assetstore.unity3d.com/api/en-US/home/categories.json?';

    return fetchRessource(categoriesUrl, options.queryParams);
  },

  'categories/:id': function (options) {
    var categoryHeadUrl = 'https://www.assetstore.unity3d.com/api/en-US/head/category/:id.json?';

    return fetchRessourceById(categoryHeadUrl, options);
  },

  'categories/:id/packages': function (options) {
    var categoryPackagesUrl = 'https://www.assetstore.unity3d.com/api/en-US/category/results/:id.json?'

    return fetchRessourceById(categoryPackagesUrl, options);
  },

  'publishers/:id': function (options) {
    var publisherOverviewUrl = 'https://www.assetstore.unity3d.com/api/en-US/publisher/overview/:id.json?';

    return fetchRessourceById(publisherOverviewUrl, options);
  },

  'publishers/:id/packages': function (options) {
    var publisherPackagesUrl = 'https://www.assetstore.unity3d.com/api/en-US/publisher/results/:id.json?';

    return fetchRessourceById(publisherPackagesUrl, options);
  }
};

function fetchRessource(url, query) {
  return new Promise(function (resolve, reject) {
    request({ url: url, qs: query, headers: { 'X-Unity-Session': token } }, function (err, res, body) {
      if (err) reject(err);
      else resolve(JSON.parse(body));
    });
  });
}

function fetchRessourceById(url, options) {
  var formatedUrl = url.replace(':id', options.namedParams.id);

  return fetchRessource(formatedUrl, options.queryParams);
}

var api = module.exports = {
  get: function (url, query) {
    var search = querystring.stringify(query);

    if (search) url += '?' + search;

    return new Promise(function (resolve, reject) {
      for (var route in routes) {
        var pattern = RoutePattern.fromString(route);
        var matches = pattern.match(url);

        if (matches) {
          var handler = routes[route];
          return handler(matches).then(resolve, reject);
        }
      }

      reject(error404());
    });
  }
};

function error404() {
  var err = new Error('Not Found');
  err.status = 404;
  return err;
}
