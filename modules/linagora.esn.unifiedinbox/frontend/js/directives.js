'use strict';

angular.module('linagora.esn.unifiedinbox')

  .directive('inboxFab', function($timeout, boxOverlayService) {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/partials/inbox-fab.html',
      link: function(scope, element) {

        function findButton() {
          return element.children('button').first();
        }

        function disableFab() {
          var button = findButton();
          button.removeClass('btn-accent');
          scope.isDisabled = true;
        }

        function enableFab() {
          var button = findButton();
          button.addClass('btn-accent');
          scope.isDisabled = false;
        }

        scope.$on('box-overlay:no-space-left-on-screen', function() {
          disableFab();
        });

        scope.$on('box-overlay:space-left-on-screen', function() {
          enableFab();
        });

        $timeout(function() {
          if (!boxOverlayService.spaceLeftOnScreen()) {
            disableFab();
          } else {
            enableFab();
          }
        });
      }
    };
  })

  .directive('inboxMenu', function(session, jmapClient) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/unifiedinbox/views/sidebar/sidebar-menu.html',
      link: function(scope) {
        scope.toggleOpen = function() {
          if (!scope.mailboxes) {
            jmapClient.getMailboxes().then(function(mailboxes) {
              scope.mailboxes = mailboxes;
            });
          }
        };

        scope.email = session.user.preferredEmail;
      }
    };
  })

  .directive('mailboxDisplay', function(MAILBOX_ROLE_ICONS_MAPPING) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        mailbox: '='
      },
      templateUrl: '/unifiedinbox/views/sidebar/mailbox-display.html',
      link: function(scope) {
        scope.mailboxIcons = MAILBOX_ROLE_ICONS_MAPPING[scope.mailbox.role.value || 'default'];
      }
    };
  })

  .directive('emailer', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        emailer: '='
      },
      templateUrl: '/unifiedinbox/views/partials/emailer.html'
    };
  })

  .directive('emailerGroup', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        group: '='
      },
      templateUrl: '/unifiedinbox/views/partials/emailer-group.html'
    };
  })

  .directive('htmlEmailBody', function(createHtmlElement, iFrameResize) {
    return {
      restrict: 'E',
      scope: {
        email: '='
      },
      templateUrl: '/unifiedinbox/views/partials/html-email-body.html',
      link: function(scope, element) {
        element.find('iframe').load(function(event) {
          scope.$emit('iframe:loaded', event.target);
        });

        scope.$on('iframe:loaded', function(event, iFrame) {
          var iFrameDocument = iFrame.contentDocument;

          iFrameDocument.body.appendChild(createHtmlElement('script', {src: '/components/iframe-resizer/js/iframeResizer.contentWindow.js'}));
          iFrameDocument.head.appendChild(createHtmlElement('base', {target: '_blank'}));

          iFrameResize({
            checkOrigin: false,
            scrolling: true,
            inPageLinks: true
          }, iFrame);
        });
      }
    };
  })

  .directive('inboxAttachment', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        attachment: '='
      },
      templateUrl: '/unifiedinbox/views/partials/inbox-attachment.html'
    };
  })

  .directive('composer', function(notificationFactory) {
    return {
      restrict: 'E',
      templateUrl: '/unifiedinbox/views/partials/composer.html',
      controller: 'composerController',
      link: function(scope) {

        scope.isCollapsed = true;

        scope.send = function send() {
          notificationFactory.weakSuccess('Success', 'Your email has been sent');
          scope.$hide();
        };

        scope.$on('$destroy', function() {
          notificationFactory.weakInfo('Note', 'Your email has been saved as draft');
        });
      }
    };
  })

  .directive('recipientsAutoComplete', function() {
    return {
      restrict: 'E',
      require: '^composer',
      scope: {
        tags: '=ngModel'
      },
      templateUrl: '/unifiedinbox/views/partials/recipients-auto-complete.html',
      link: function($scope, element, attrs, composer) {
        $scope.search = composer.search;
      }
    };
  })

  .directive('fullscreenRecipientsAutoComplete', function() {
    return {
      restrict: 'E',
      require: '^composer',
      scope: {
        tags: '=ngModel'
      },
      templateUrl: '/unifiedinbox/views/partials/fullscreen-recipients-auto-complete.html',
      link: function($scope, element, attrs, composer) {
        $scope.search = composer.search;
      }
    };
  });
