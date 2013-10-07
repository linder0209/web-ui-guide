angular.module('dialogDemoApp').directive('dialog', function() {
  return {
    restrict: 'EA',
    templateUrl: 'dialog_tmpl.html',
    transclude: true,
    replace: true,
    scope: {
      dialogTitle: '=',
      show: '=',
      close: '&',
      ok: '&',
      onShow: '&',
      onShown: '&',
      onHide: '&',
      onHidden: '&'
    },
    link: function(scope, iElement, iAttrs, controller) {
      $(iElement[0]).on({'show.bs.modal': function() {
          if ($.isFunction(scope.onShow)) {
            scope.onShow();
          }
        }, 'shown.bs.modal': function() {
          if ($.isFunction(scope.onShown)) {
            scope.onShown();
          }
        }, 'hide.bs.modal': function() {
          if ($.isFunction(scope.onHide)) {
            scope.onHide();
          }
        }, 'hidden.bs.modal': function() {
          if ($.isFunction(scope.onHidden)) {
            scope.onHidden();
          }
        }});

      scope.$watch('show', function(show) {
        if (show) {
          $(iElement[0]).modal('show');
        } else {
          $(iElement[0]).modal('hide');
        }
      });
      scope.close = function() {
        scope.show = false;
      };
    }
  };
});