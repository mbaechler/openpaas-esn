'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('directive : action-list', function() {
  var element, $scope, $compile, $rootScope, screenSize, $modal, $popover, onResize;

  beforeEach(function() {
    screenSize = {
      onChange: function(scope, event, callback) {
        onResize = callback;
      },
      get: angular.noop,
      is: angular.noop
    };
    this.opened = {
      destroy: sinon.spy(),
      hide: sinon.spy()
    };
    var self = this;
    $modal = sinon.spy(function() {
      return self.opened;
    });
    $popover = sinon.spy(function() {
      return self.opened;
    });
  });

  beforeEach(function() {
    angular.mock.module('jadeTemplates');
    angular.mock.module('esn.actionList');

    angular.mock.module(function($provide) {
      $provide.value('screenSize', screenSize);
      $provide.value('$modal', $modal);
      $provide.value('$popover', $popover);
    });
  });

  beforeEach(angular.mock.inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();

    this.initDirective = function(html) {
      element = $compile(html)($scope);
      $scope.$digest();
      return element;
    };
  }));

  it('should not propagate the click to the parent elements', function() {
    screenSize.is = function(match) {
      expect(match).to.equal('xs, sm');
      return true;
    };

    this.initDirective('<div ng-click="parentClicked = true"><button action-list>Click Me</button></div>');
    element.find('button').click();

    expect($scope.parentClicked).to.equal(undefined);
  });

  it('should not run the default handlers of parent links', function(done) {
    screenSize.is = function(match) {
      expect(match).to.equal('xs, sm');
      return true;
    };

    var event = {
      type: 'click',
      stopImmediatePropagation: angular.noop,
      preventDefault: done
    };

    this.initDirective('<a href="/should/not/go/there"><button action-list>Click Me</button></a>');

    element.find('button').triggerHandler(event);
  });

  it('should open a $modal when screen size is <= sm', function() {
    screenSize.is = function(match) {
      expect(match).to.equal('xs, sm');
      return true;
    };
    this.initDirective('<button action-list>Click Me</button>');
    element.click();

    expect($modal).to.have.been.called;
  });

  it('should open a $popover when screen size is > sm', function() {
    screenSize.is = function() {
      return false;
    };
    this.initDirective('<button action-list>Click Me</button>');
    element.click();

    expect($popover).to.have.been.called;
  });

  it('should first open a $modal when screen size is xs, then open a $popover when it changes to lg', function() {
    screenSize.is = sinon.stub();
    screenSize.is.onCall(0).returns(true);
    screenSize.is.onCall(1).returns(false);
    this.initDirective('<button action-list>Click Me</button>');
    element.click();
    expect($modal).to.have.been.called;

    this.opened.$isShown = function() { return false; };

    onResize(false);
    element.click();
    expect($popover).to.have.been.called;
  });

  it('should not resize a modal/popover of other directive', function() {
    screenSize.is = sinon.stub();
    screenSize.is.onCall(0).returns(true);
    screenSize.is.onCall(1).returns(false);
    this.initDirective('<button action-list>Click Me</button>');

    element.click();

    expect($modal).to.have.been.called;
    this.opened.scope = {};
    onResize(false);

    expect($popover).to.not.have.been.called;
  });

  it('should first open a $popover when screen size is lg, then open a $modal when it changes to xs', function() {
    screenSize.is = sinon.stub();
    screenSize.is.onCall(0).returns(false);
    screenSize.is.onCall(1).returns(true);
    this.initDirective('<button action-list>Click Me</button>');
    element.click();
    expect($popover).to.have.been.called;

    onResize(true);
    element.click();
    expect($modal).to.have.been.called;
  });

  it('should not reopen $modal when the screen is resized twice, when screen size still <= xs', function() {
    screenSize.is = sinon.stub();
    screenSize.is.onCall(0).returns(false);
    screenSize.is.onCall(1).returns(false);
    this.initDirective('<button action-list>Click Me</button>');
    element.click();

    onResize(false);
    expect($popover).to.have.been.callCount(1);
    expect($modal).to.have.not.been.called;
  });

  it('should not reopen $popover when the screen is resized twice, when screen size still > xs', function() {
    screenSize.is = sinon.stub();
    screenSize.is.onCall(0).returns(true);
    screenSize.is.onCall(1).returns(true);
    this.initDirective('<button action-list>Click Me</button>');
    element.click();

    onResize(true);
    expect($modal).to.have.been.callCount(1);
    expect($popover).to.have.not.been.called;
  });

  it('should hide the dialog when it is already shown', function() {
    screenSize.is = function() {
      return true;
    };
    this.initDirective('<button action-list>Click Me</button>');

    element.click();
    element.click();

    expect(this.opened.hide).to.have.been.callCount(1);
  });

  it('should not open multiple $modal', function() {
    screenSize.is = function() {
      return true;
    };
    this.initDirective('<button action-list>Click Me</button>');

    element.click();
    element.click();
    element.click();
    element.click();

    expect(this.opened.hide).to.have.been.callCount(3);
  });

  it('should not open multiple $popover', function() {
    screenSize.is = function() {
      return false;
    };
    this.initDirective('<button action-list>Click Me</button>');

    element.click();
    element.click();
    element.click();
    element.click();

    expect(this.opened.hide).to.have.been.callCount(3);
  });

  it('should call $modal with template url', function() {
    screenSize.is = function() {
      return true;
    };
    this.initDirective('<button action-list action-list-url="expected-url.html">Click Me</button>');
    element.click();

    expect($modal).to.have.been.calledWith(sinon.match({
      template: '<div class="action-list-container modal"><div class="modal-dialog modal-content" ng-include="\'expected-url.html\'"></div></div>'
    }));
  });

  it('should call $popover with template url', function() {
    screenSize.is = function() {
      return false;
    };
    this.initDirective('<button action-list action-list-url="expected-url.html">Click Me</button>');
    element.click();

    expect($popover).to.have.been.calledWith(sinon.match.any, sinon.match({
      template: '<div class="action-list-container popover"><div class="popover-content" ng-include="\'expected-url.html\'"></div></div>'
    }));
  });

  it('should call hide on $modal or $popover after a screen resize', function() {
    screenSize.is = sinon.stub();
    screenSize.is.onCall(0).returns(false);
    screenSize.is.onCall(1).returns(true);
    var onResize;
    screenSize.onChange = function(scope, event, callback) {
      onResize = callback;
    };

    this.initDirective('<button action-list>Click Me</button>');
    element.click();
    expect($popover).to.have.been.called;

    onResize(true);
    element.click();
    expect($modal).to.have.been.called;
    expect(this.opened.hide).to.have.been.called;
  });

  it('should not destroy a dialog if it is shown', function() {
    this.initDirective('<button action-list>Click Me</button>');
    element.click();
    this.opened.$isShown = true;

    $scope.$destroy();

    expect(this.opened.destroy).to.not.have.been.called;
  });

  it('should destroy a non-shown along with the dialogLock', function() {
    this.initDirective('<button action-list>Click Me</button>');
    element.click();
    this.opened.$isShown = false;

    $scope.$destroy();

    expect(this.opened.destroy).to.have.been.calledTwice;
  });

  it('should destroy the dialog on $destroy', function() {
    this.initDirective('<button action-list>Click Me</button>');
    element.click();
    $scope.$destroy();

    expect(this.opened.destroy).to.have.been.called;
  });

  it('should destroy the dialog on action-list.hide', function() {
    this.initDirective('<button action-list>Click Me</button>');
    element.click();
    $scope.$broadcast('action-list.hide');

    expect(this.opened.destroy).to.have.been.called;
  });

  it('should not destroy the dialog belong to other element on $destroy', function() {
    var scope1, scope2;
    scope1 = $scope = $rootScope.$new();
    this.initDirective('<button action-list>1</button>');

    scope2 = $scope = $rootScope.$new();
    var element2 = this.initDirective('<button action-list>2</button>');

    element2.click(); // dialog is now belong to scope2
    scope1.$destroy();

    expect(this.opened.destroy).to.have.been.callCount(0);
  });

});
