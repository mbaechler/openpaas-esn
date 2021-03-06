'use strict';

module.exports = function(dependencies) {

  var logger = dependencies('logger');

  function finalizeWorkflow(type, req, res) {
    logger.info('Finalize callback');
    if (req.query.denied) {
      return res.redirect('/#/accounts?status=denied&provider=' + type + '&token=' + req.query.denied);
    }

    if (req.oauth && req.oauth.status) {
      var status = req.oauth.status;
      return res.redirect('/#/accounts?provider=' + type + '&status=' + status);
    }
    res.redirect('/#/accounts?provider=' + type);
  }

  function unknownAuthErrorMiddleware(type, regexp) {
    return function(err, req, res, next) {
      if (err && regexp.test(err.message)) {
        return res.redirect('/#/accounts?status=config_error&provider=' + type);
      }
      next(err);
    };
  }

  return {
    finalizeWorkflow: finalizeWorkflow,
    unknownAuthErrorMiddleware: unknownAuthErrorMiddleware
  };
};
