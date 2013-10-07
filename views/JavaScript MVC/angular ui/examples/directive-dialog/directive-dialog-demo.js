//创建一个app，并在该app下创建一个controller
angular.module('dialogDemoApp', []).controller('DialogDemoController', ['$scope', function($scope) {
    $scope.dialogTitle = 'Change Password';
    $scope.dialogShow = false;
    //$scope.cancelText = 'Cancel';
    //$scope.okText = 'Ok';
    $scope.closeForm = function(){
      $('#changePasswordForm input').val('');
      $('#changePasswordForm').validate().resetForm();
    };
    $scope.changePassword = function() {
      var form = $('#changePasswordForm');
      form.submit();
      if (form.valid()) {
        $scope.dialogShow = false;
      }
    };
    $scope.submitPassword = function() {
      alert('修改密码');
    };
  }]);

angular.module('dialogDemoApp').directive('changePasswordValidator', function() {
  return {
    restict: 'A',
    link: function(scope, element) {
      $(element[0]).validate({
        onfocusout: function(e) {
          $(e).valid();
        },
        ignore: ':hidden, :button',
        errorClass: 'text-danger',
        submitHandler: function() {
          scope.submitPassword();
        },
        rules: {
          confirmPassword: {
            equalTo: '#firstPassword'
          }
        },
        messages: {
          confirmPassword: {
            equalTo: '两次输入的密码不一致'
          }
        }
      });
    }
  };
});