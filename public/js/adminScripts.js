var AS= (function() { 
  'use strict';
  var _valid,
      _testData = {},
      _loggedIn = window.sessionStorage.getItem('login'),
      $loginForm = $('[data-js=login'),
      $newUser = $('[data-js=new'),
      $login = $('[data-js=login]'),
      $results = $('[data-results]'),
      $heading = $('[data-heading]'),
      $admin = $('[data-admin');

  return {
    hideLogin : function() {
      $login.fadeOut('fast');
      $results.fadeOut('fast');
      $heading.text('EC ADMIN PAGE');
      $admin.show();
    },

    showLogin : function() {
      window.sessionStorage.clear();
      $login.fadeIn('fast');
      $results.hide();
      $heading.text('EC LOGIN PAGE');
      $admin.fadeOut('fast');
      $loginForm.find('[data-js=password]').val('');
      $loginForm.find('[data-js=user-name]').val('');
      window.location.reload();
    },

    newUser : function() {
      $newUser.fadeIn('fast');
      $newUser.find('[data-js=password]').val('');
      $newUser.find('[data-js=user-name]').val('');
      $newUser.find('[data-js=verify]').val('');
      $('[data-hide-add]').on('click', function() {
        $newUser.fadeOut('fast');
      });
      AS.submitNewUser();
    },

    loginResponse : function(response) {
      var res = response;
      switch(res) {
        case '200':
          AS.hideLogin();
          window.sessionStorage.setItem('login', MD5(_testData.userName));
          break;
        case '304':
          $results.text('Password is incorrect, please try again.');
          break;
        case '305':
          $results.text('Unrecognized username');
          break;
        default:
          break;
      }
    },

    newResponse : function(response) {
      var res = response;
      if (res ==='username') $results.text('Username already in use, please try again.');
      if (res === '200') {
        $results.text('New User Added, Thank You!');
        $newUser.fadeOut('fast');
      }
    },

    postForm : function(postData, type, ev) {
      $.ajax({
        url:'/admin',
        method: 'POST',
        data: postData,
        success: function (response) {
          if (type === 'login') AS.loginResponse(response);
          if (type === 'newuser') AS.newResponse(response);
        },
        error: function(jqxhr) {
          if (type === 'login') $results.text('Password and Username are incorrect, please try again.');
          if (type === 'newuser') $results.text('Error');
        }
      });

      $(ev.target).addClass('no-pointer');
      (type === 'login') ? $results.fadeIn('slow').text('Please wait, logging in...') : $results.fadeIn('slow').text('Adding New User...');
      setTimeout(function() {
        $(ev.target).removeClass('no-pointer');
        $results.fadeOut('slow');
      }, 3000);
    },

    inputError : function($container, selector) {
      $container.find(selector)
        .fadeIn('slow')
        .delay(2000)
        .fadeOut('slow');
    },

    validateInput : function($container, _testData, ev) {
      var emailReg = /^([\w-\.]+@tahoepartners.com)?$/;
      if (!_testData.userName || _testData.userName === 'User Name *') {
        AS.inputError($container, '[data-error=user]');
        return false;
      }
      if (!emailReg.test(_testData.userName)) {
        AS.inputError($container, '[data-error=2]');
        return false;
      }
      if (!_testData.password || _testData.password === 'Password *') {
        AS.inputError($container, '[data-error=password]');
        return false;
      }
      if ((_testData.type === 'newuser') && (!_testData.verify || _testData.verify === 'Verify Password *')) {
        AS.inputError($container, '[data-error=verify]');
        return false;
      }
      if ((_testData.type === 'newuser') && (_testData.password !== _testData.verify)) {
        AS.inputError($container, '[data-error=verify2]');
        return false;
      }
      _valid = true;
      if (_valid) {
        _testData['password'] = MD5(_testData.password);
        if (_testData.type === 'newuser') _testData['verify'] = MD5(_testData.verify);
        var type = _testData.type,
            postData = $.param(_testData);
        AS.postForm(postData, type, ev);
      }
    },

    submitLogin : function() {
      if (_loggedIn) {
        AS.hideLogin();
      } else {
        $('[data-button=login]').on('click', function (ev) {
          ev.preventDefault();
          var stamp = new Date();
          _valid = false;
          _testData = {
            userName : $loginForm.find('[data-js=user-name]').val(),
            password : $loginForm.find('[data-js=password]').val(),
            stamp : stamp,
            type : 'login'
          };
          AS.validateInput($loginForm, _testData, ev);
        });
      }
    },

    submitNewUser : function() {
     $('[data-button=new]').on('click', function (ev) {
        ev.preventDefault();
        var stamp = new Date();
        _valid = false;
        _testData = {
          userName : $newUser.find('[data-js=user-name]').val(),
          password : $newUser.find('[data-js=password]').val(),
          verify : $newUser.find('[data-js=verify]').val(),
          stamp : stamp,
          type : 'newuser'
        };
        AS.validateInput($newUser, _testData, ev);
      });
    },

    init : function() {
      AS.submitLogin();
      $('[data-logout]').on('click', AS.showLogin);
      $('[data-add]').on('click', AS.newUser);
    }
  };
})();
AS.init();


