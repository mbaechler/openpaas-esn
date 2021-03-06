'use strict';

angular.module('linagora.esn.unifiedinbox')

  .directive('listEmailsSubheader', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/list-emails/subheader.html'
    };
  })

  .directive('viewEmailSubheader', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/view-email/subheader.html'
    };
  })

  .directive('viewThreadSubheader', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/view-thread/subheader.html'
    };
  })

  .directive('composerSubheader', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/composer/subheader.html'
    };
  })

  .directive('configurationIndexSubheader', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/configuration/subheader.html'
    };
  })

  .directive('addFolderSubheader', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/configuration/folders/add/subheader.html'
    };
  })

  .directive('editFolderSubheader', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/configuration/folders/edit/subheader.html'
    };
  })

  .directive('fullscreenEditFormSubheader', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/composer/fullscreen-edit-form/subheader.html'
    };
  })

  .directive('inboxSubheaderCloseButton', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/partials/subheader/close-button.html'
    };
  })

  .directive('inboxSubheaderBurgerButton', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/partials/subheader/burger-button.html'
    };
  })

  .directive('inboxSubheaderBackButton', function() {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/partials/subheader/back-button.html'
    };
  });
