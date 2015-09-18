'use strict';

angular.module('esn.multi-input', [])
.controller('MultiInputGroupController', function($scope, $timeout) {
    function _updateTypes() {
      $scope.newItem.type = $scope.types[$scope.content.length % $scope.types.length];
    }

    this.acceptNew = function() {
      $scope.content.push($scope.newItem);
      $scope.newItem = {};
      _updateTypes();
    };

    function _acceptRemove($index) {
      $scope.content.splice($index, 1);
      _updateTypes();
    }

    this.acceptRemove = function($index) {
      $scope.content.splice($index, 1);
      _updateTypes();
    };

    this.createVerifyRemoveFunction = function(valueToCheck) {
      return function($index) {
        var item = $scope.content[$index];
        if (!item[valueToCheck]) {
          _acceptRemove($index);
        }
      };
    };

    this.createVerifyRemoveAddressFunction = function(/* valuesToCheck... */) {
      var args = arguments;
      return function($index) {
       $scope.content.forEach(function(item) {
          if (Array.prototype.every.call(args, function(arg) { return !item[arg]; })) {
            _acceptRemove($index);
          }
        });
      };
    };

    $scope.$watch('content', _updateTypes);

    $scope.content = [];
    $scope.newItem = {};
  })
  .directive('resetableInput', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, controller) {
        var button = element[0].getElementsByClassName('button-remove');
        element[0].addEventListener('focusin', function(event) {
          setTimeout(function() {
            button[0].classList.remove('invisible');
          }, 100);
        });
        element[0].addEventListener('focusout', function(event) {
          setTimeout(function() {
            button[0].classList.add('invisible');
          }, 100);
        });
      }
    };
  })
  .directive('multiInputGroup', function() {
    return {
      restrict: 'E',
      scope: {
        content: '=multiInputModel',
        types: '=multiInputTypes',
        inputType: '@multiInputTexttype',
        placeholder: '@multiInputPlaceholder'
      },
      templateUrl: '/views/modules/multi-input/multi-input-group.html',
      controller: 'MultiInputGroupController',
      link: function(scope, element, attrs, controller) {
        scope.verifyNew = function() {
          if (scope.newItem.value) {
            scope.showAddButton = true;
          }
          else {
            scope.showAddButton = false;
          }
        };
        scope.acceptNew = function() {
          if (scope.newItem.value) {
            controller.acceptNew();
          }
          _init();
        };
        scope.addField = function() {
          scope.showAddButton = false;
          scope.showNextField = true;
        };
        function _init() {
          if (scope.content.length === 0) {
            scope.showAddButton = false;
            scope.showNextField = true;
          }
          else {
            scope.showAddButton = true;
            scope.showNextField = false;
          }
        }
        scope.$watch('content', function() {
          _init();
        });

        scope.verifyRemove = controller.createVerifyRemoveFunction('value');
        scope.deleteField = function(index) {
          controller.acceptRemove(index);
        };
      }
    };
  })
  .directive('multiInputGroupAddress', function() {
    return {
      restrict: 'E',
      scope: {
        content: '=multiInputModel',
        types: '=multiInputTypes',
        inputType: '@multiInputTexttype',
        placeholder: '@multiInputPlaceholder'
      },
      templateUrl: '/views/modules/multi-input/multi-input-group-address.html',
      controller: 'MultiInputGroupController',
      link: function(scope, element, attrs, controller) {
        function isAddressFilled() {
          if (scope.newItem.zip || scope.newItem.street || scope.newItem.city || scope.newItem.country) {
            return true;
          }
          return false;
        }
        scope.verifyNew = function() {
          if (isAddressFilled()) {
            scope.showAddButton = true;
          }
          else {
            scope.showAddButton = false;
          }
        };
        scope.acceptNew = function() {
          if (isAddressFilled()) {
            controller.acceptNew();
          }
          scope.showAddButton = true;
          scope.showNextField = false;
        };
        scope.addField = function() {
          scope.showAddButton = false;
          scope.showNextField = true;
        };
        function _init() {
          if (scope.content.length === 0) {
            scope.showAddButton = false;
            scope.showNextField = true;
          }
          else {
            scope.showAddButton = true;
            scope.showNextField = false;
          }
        }
        scope.$watch('content', function() {
          _init();
        });
        scope.verifyRemove = controller.createVerifyRemoveAddressFunction('street', 'zip', 'country', 'city');
        scope.deleteAddress = function(index) {
          controller.acceptRemove(index);
        };
      }
    };
  });
