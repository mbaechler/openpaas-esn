'use strict';

var features = require('../../core/features');

module.exports.loadFeaturesForUser = function(req, res, next) {
  if (!req.user || !req.user.domains || req.user.domains.length === 0) {
    return next();
  }

  features.findFeaturesForDomain(req.user.domains[0].domain_id, function(err, features) {
    if (err) {
      return next(err);
    }

    req.user.features = features;

    next();
  });
};
