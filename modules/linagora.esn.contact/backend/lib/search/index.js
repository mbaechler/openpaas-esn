'use strict';

var denormalize = require('./denormalize');
var CONSTANTS = require('../constants');

var CONTACT_ADDED = CONSTANTS.NOTIFICATIONS.CONTACT_ADDED;
var CONTACT_UPDATED = CONSTANTS.NOTIFICATIONS.CONTACT_UPDATED;
var CONTACT_DELETED = CONSTANTS.NOTIFICATIONS.CONTACT_DELETED;
var INDEX_NAME = CONSTANTS.SEARCH.INDEX_NAME;
var TYPE_NAME = CONSTANTS.SEARCH.TYPE_NAME;
var DEFAULT_LIMIT = CONSTANTS.SEARCH.DEFAULT_LIMIT;

module.exports = function(dependencies) {

  var pubsub = dependencies('pubsub').global;
  var logger = dependencies('logger');
  var elasticsearch = dependencies('elasticsearch');

  function indexContact(contact, callback) {
    logger.debug('Indexing contact into elasticseach', contact);

    if (!contact) {
      return callback(new Error('Contact is required'));
    }

    elasticsearch.addDocumentToIndex(denormalize(contact), {index: INDEX_NAME, type: TYPE_NAME, id: contact.id + ''}, callback);
  }

  function removeContactFromIndex(contact, callback) {
    logger.info('Removing contact from index', contact);

    if (!contact) {
      return callback(new Error('Contact is required'));
    }

    elasticsearch.removeDocumentFromIndex({index: INDEX_NAME, type: TYPE_NAME, id: contact.id + ''}, callback);
  }

  function searchContacts(query, callback) {
    var terms = query.search;
    var page = query.page || 1;
    var offset = query.offset;
    var limit = query.limit || DEFAULT_LIMIT;

    var filters = [];
    if (query.userId) {
      filters.push({
        term: {
          userId: query.userId
        }
      });
    }

    if (query.bookId) {
      filters.push({
        term: {
          bookId: query.bookId
        }
      });
    }

    if (query.bookName) {
      filters.push({
        term: {
          bookName: query.bookName
        }
      });
    }

    var elasticsearchQuery = {
      query: {
        filtered: {
          query: {
            multi_match: {
              query: terms,
              type: 'cross_fields',
              fields: ['firstName^1000',
                'lastName^1000',
                'nickname^1000',
                'org^100',
                'tel.value^100',
                'tags.text^100',
                'comments^100',
                'emails.value^100',
                'socialprofiles.value^100',
                'job^10',
                'birthday',
                'urls.value',
                'addresses.full'],
              operator: 'and',
              tie_breaker: 0.5
            }
          }
        }
      }
    };
    if (filters.length) {
      elasticsearchQuery.query.filtered.filter = {
        and: filters
      };
    }
    if (!offset) {
      offset = (page - 1) * limit;
    }

    logger.debug('Searching contacts with options', {
      userId: query.userId,
      bookId: query.bookId,
      bookName: query.bookName,
      search: terms,
      page: page,
      offset: offset,
      limit: limit
    });

    elasticsearch.searchDocuments({
      index: INDEX_NAME,
      type: TYPE_NAME,
      from: offset,
      size: limit,
      body: elasticsearchQuery
    }, function(err, result) {
      if (err) {
        return callback(err);
      }
      return callback(null, {
        current_page: page,
        total_count: result.hits.total,
        list: result.hits.hits
      });
    });
  }

  function listen() {

    logger.info('Subscribing to contact updates for indexing');

    pubsub.topic(CONTACT_ADDED).subscribe(function(data) {
      var contact = data;
      contact.id = data.contactId;

      indexContact(contact, function(err) {
        if (err) {
          logger.error('Error while adding contact in index', err);
        }
      });
    });

    pubsub.topic(CONTACT_UPDATED).subscribe(function(data) {
      var contact = data;
      contact.id = data.contactId;

      indexContact(contact, function(err) {
        if (err) {
          logger.error('Error while updating contact in index', err);
        }
      });
    });

    pubsub.topic(CONTACT_DELETED).subscribe(function(data) {
      removeContactFromIndex({id: data.contactId}, function(err) {
        if (err) {
          logger.error('Error while deleting contact from index', err);
        }
      });
    });
  }

  return {
    listen: listen,
    searchContacts: searchContacts,
    indexContact: indexContact,
    removeContactFromIndex: removeContactFromIndex
  };

};
