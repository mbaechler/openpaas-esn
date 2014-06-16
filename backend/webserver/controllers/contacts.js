'use strict';

var mongoose = require('mongoose');
var OAuth2Client = require('googleapis').OAuth2Client;
var https = require('https');
var contactHelper = require('../../core/contact/helper');
var contactModule = require('../../core').contact;

function isValidObjectId(id) {
  try {
    new mongoose.Types.ObjectId(id);
  } catch (e) {
    return false;
  }
  return true;
}

var areAddressBookIdsValid = function(address_book_ids) {
  var idArray;
  if (address_book_ids instanceof Array) {
    idArray = address_book_ids;
  }
  else {
    idArray = [address_book_ids];
  }
  var valid = true;
  idArray.forEach(function(id) {
    if (!isValidObjectId(id)) {
      valid = false;
    }
  });
  return valid;
};

function getContacts(req, res) {
  if (!req.query.owner) {
    return res.json(412, {error: {status: 412, message: 'parameter missing', details: '"owner" parameter should be set'}});
  }

  if (!isValidObjectId(req.query.owner)) {
    return res.json(412, {error: {status: 412, message: 'Invalid parameter', details: '"owner" parameter should be a valid objectId'}});
  }

  var query = {
    owner: req.query.owner,
    query: req.param('search') || null,
    addressbooks: req.param('addressbooks') || null
  };

  if (req.param('limit')) {
    var limit = parseInt(req.param('limit'));
    if (!isNaN(limit)) {
      query.limit = limit;
    }
  }
  if (req.param('offset')) {
    var offset = parseInt(req.param('offset'));
    if (!isNaN(offset)) {
      query.offset = offset;
    }
  }

  if (query.addressbooks && !areAddressBookIdsValid(query.addressbooks)) {
    return res.json(400, { error: { status: 400, message: 'Server error', details: 'Bad request : address book id is not a valid id'}});
  }

  contactModule.list(query, function(err, response) {
    if (err) {
      return res.json(500, { error: { status: 500, message: 'Contacts list failed', details: err}});
    }
    res.header('X-ESN-Items-Count', response.count);
    return res.json(200, response.items);
  });
}
module.exports.getContacts = getContacts;


var singleClient = null;
function getOAuthClient(baseUrl) {
  if (!singleClient) {
    var CLIENT_ID = '810414134078-2mvksu56u3grvej4tg67pb64tlmsqf92.apps.googleusercontent.com';
    var CLIENT_SECRET = 'h-9jLjgIsugUlKYhv2ThV11E';
    var REDIRECT_URL = baseUrl + '/api/contacts/google/callback';
    singleClient = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  }
  return singleClient;
}

function getOAuthURL(req, res) {
  var oauth2Client = getOAuthClient(req.protocol + '://' + req.get('host'));
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.google.com/m8/feeds'
  });
  res.json({url: url});
}
module.exports.getOAuthURL = getOAuthURL;


function fetchContacts(req, response) {
  if (!req.user || !req.user.emails || !req.user.emails.length) {
    return response.send(500, 'User not set');
  }

  var code = req.query.code;
  if (!code) {
    return response.redirect('/#/contacts');
  }

  var oauth2Client = getOAuthClient();
  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      return response.json(500, {error: 500, message: 'Could not get authentication token', details: err});
    }

    oauth2Client.setCredentials(tokens);
    var options = {
      host: 'www.google.com',
      port: 443,
      path: '/m8/feeds/contacts/default/full',
      headers: {
        'GData-Version': '3.0',
        'Authorization': 'Bearer ' + oauth2Client.credentials.access_token
      }
    };

    https.get(options, function(res) {
      var body = '';
      res.on('data', function(data) {
        body += data;
      });

      res.on('end', function() {
        contactHelper.saveGoogleContacts(body, req.user, function(err) {
          if (err) {
            return response.json(500, {error: 500, message: 'Could not save contacts', details: err});
          }
          response.redirect('/#/contacts');
        });
      });

      res.on('error', function(e) {
        return response.json(500, {error: 500, message: 'Contact fetch error', details: e});
      });
    });
  });

}
module.exports.fetchContacts = fetchContacts;
