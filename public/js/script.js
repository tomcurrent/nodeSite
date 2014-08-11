$('[href=#get-started]').text('GET STARTED');
var EC = (function() { 
  'use strict';
  var $capeLink = $('[data-js=cape-link]'),
      $dataNav = $('[data-navigation]'),
      $contactForm = $('[data-js=contact]'),
      $subscribeForm = $('[data-js=subscribe]'),
      $reportForm = $('[data-js=report]'),
      $dataResults = $('[data-results]'),
      _checkArray = [],
      _testData = {},
      _reason = 'general',
      _valid;

  return {
    pageSpecific: function() {
      var pageLocation = window.location.href;
      if (pageLocation.match('owner')) $('html').addClass('owner');
    },

    modalSetUp: function() {
      var matchCase = function(newCase) {
        $('[data-target=".portfolio-modal"]').each(function(i, el) {
          var portTitle = $(el).data('title');
          if (newCase === portTitle) {
             $('[data-dismiss=modal]').trigger('click');
            setTimeout(function() {
              $('[data-title="' + portTitle + '"]').trigger('click');
            }, 500);
          }
        });
      };

      $('[data-modal=blogs]').on('click', '[data-toggle=modal]', function(ev) {
        var content = $('[data-template=blog-template]').html(),
            dataUrl = 'data/blogs.json',
            appendTo = $('[data-append=modal-blog]'), 
            title = $(this).data('title').toLowerCase(),
            selector = '.generic-blog',
            key = 'genericBlog';
        ModalModule.getData(content, dataUrl, appendTo, title, selector, key);
      });

      $('[data-modal=portfolio]').on('click', '[data-toggle=modal]', function() {
        var content = $('[data-template=portfolio-template]').html(),
            dataUrl = 'data/heros.json',
            appendTo = $('[data-append=modal-portfolio]'),
            title = $(this).data('title').toLowerCase(),
            selector = '.portfolio-modal',
            key = 'portfolio';
        ModalModule.getData(content, dataUrl, appendTo, title, selector, key);
      });

      $('[data-append]').on('click', '[data-trigger]', function() {
        var newCase = $(this).data('trigger');
        matchCase(newCase);
      });
    },

    onePageNav : function() {
      $dataNav.onePageNav({
        filter: ':not(.external)',
        scrollThreshold: 0.25,
        scrollOffset: 90
      });
    },

    formatDate : function() {
      $('[data-js=date]').each(function(i, el) {
        var val = $(el).html();
        $(el).html((new Date(val)).toString().split(' ').splice(1, 3).join(' '));
      });
    },

    setActiveState : function() {
      $('[data-links=challenge]:eq(0),' +
        '[data-links=solution]:eq(0),' +
        '[data-name=challenge]:eq(0),' +
        '[data-name=solution]:eq(0),' +
        '[data-tab=solution]:eq(0),' +
        '[data-tab=challenge]:eq(0)').addClass('active');
      $('ul.navigation li:eq(0)').addClass('current');
    },

    postForm : function(postData, type, ev) {
      $.post('/it-dev', postData);
      $(ev.target).addClass('no-pointer');
      $('[data-results=' + type + ']').fadeIn('slow');
      setTimeout(function() {
        $(ev.target).removeClass('no-pointer');
        $('[data-results=' + type + ']').fadeOut('slow');
      }, 10000);
    },

    inputError : function($container, selector) {
      $container.find(selector)
        .fadeIn('slow')
        .delay(2000)
        .fadeOut('slow');
    },

    validateInput : function($container, _testData, ev) {
      var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      if (!_testData.firstName || _testData.firstName === 'First Name *') {
        EC.inputError($container, '[data-error=first]');
        return false;
      }
      if (!_testData.lastName || _testData.lastName === 'Last Name *') {
        EC.inputError($container, '[data-error=last]');
        return false;
      }
      if (!_testData.email || _testData.email === 'Email *') {
        EC.inputError($container, '[data-error=1]');
        return false;
      }
      if (!emailReg.test(_testData.email)) {
        EC.inputError($container, '[data-error=2]');
        return false;
      }
      _valid = true;
      if (_valid) {
        var type = _testData.type,
            postData = $.param(_testData);
        EC.postForm(postData, type, ev);
      }
    },

    setForms : function() {
      EC.submitContact();
      EC.submitBlog();
      EC.submitReport();
      $subscribeForm.on('change', '[type=checkbox]', EC.setCheckbox);
      $subscribeForm.find('[data-checkbox]').click();
      $contactForm.on('change', '[type=radio]', function(ev) {EC.setRadio(ev);});
      $('[data-error]').hide();
      $('[data-js=phone]').mask('(999) 999-9999');
    },

    setRadio : function(ev) {
      _reason = $(ev.target).val();
      $contactForm.find('[type=radio]').each(function(i, el) {
        if ($(el).prop('checked')) {
          $(el).parent('label').addClass('blue');
        } else {
          $(el).parent('label').removeClass('blue').removeProp('checked');
        }
      });
    },

    setCheckbox : function() {
      $subscribeForm.find('[type=checkbox]').each(function(i, el) {
        var checkVal = $(el).val();
        if ($(el).prop('checked')) {
          $(el).siblings('label').addClass('blue');
          _checkArray.push(checkVal);
        } else {
          $(el).siblings('label').removeClass('blue').removeProp('checked');
          for (var j in _checkArray) {
            if (_checkArray[j] === checkVal) {
              _checkArray.splice(j, 1);
              break;
            }
          }
        }
      });
    },

    submitContact : function() {
      $('[data-button=contact]').on('click', function (ev) {
        ev.preventDefault();
        _valid = false;
        _testData = {
          firstName : $contactForm.find('[data-js=first-name]').val(),
          lastName : $contactForm.find('[data-js=last-name]').val(),
          email : $contactForm.find('[data-js=email]').val(),
          phone : $contactForm.find('[data-js=phone]').val(),
          message : $contactForm.find('[data-js=message]').val(),
          reason : _reason,
          type : 'contact'
        };
        EC.validateInput($contactForm, _testData, ev);
      });
    },

    submitBlog : function() {
      $subscribeForm.on('click', '[data-button=subscribe]', function(ev) {
        ev.preventDefault();
        var uniqueArray = _checkArray.filter(function(elem, pos, self) {
          return self.indexOf(elem) === pos;
        });
        _valid = false;
        _testData = {
          firstName : $subscribeForm.find('[data-js=first-name]').val(),
          lastName : $subscribeForm.find('[data-js=last-name]').val(),
          email : $subscribeForm.find('[data-js=email]').val(),
          inqType : uniqueArray,
          type : 'subscribe'
        };
        EC.validateInput($subscribeForm, _testData, ev);
    });
    },

    submitReport : function() {
      $reportForm.on('click', '[data-button=report]', function(ev) {
        ev.preventDefault();
        _valid = false;
        _testData = {
          firstName : $reportForm.find('[data-js=first-name]').val(),
          lastName : $reportForm.find('[data-js=last-name]').val(),
          email : $reportForm.find('[data-js=email]').val(),
          company : $reportForm.find('[data-js=company]').val(),
          type : 'report'
        };
        EC.validateInput($reportForm, _testData, ev);
       });
    },

    imageReplace : function() {
      $('[data-replacment]').each(function(i, el) {
        var pEl = $(el).html();
        if (pEl) $(el).removeClass('invisible');
        if ($(el).hasClass('invisible')) $(el).remove();
      });
      $('[data-name=solution] img:eq(0)').remove();
    },

    imageChange : function(type) {

    // waiting on design team for images then: TODO (refactor into loop)
      var $chart1 = $('[data-chart=challenge]:eq(0) img'),
          $chart2 = $('[data-chart=challenge]:eq(1) img'),
          $chart3 = $('[data-chart=challenge]:eq(2) img');
      $chart1.attr('src', $chart1.data('src') + type + '.jpg');
      $chart2.attr('src', $chart2.data('src'));
      $chart3.attr('src', $chart3.data('src'));
    },

    setSize : function() {
      var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      if (windowWidth >= 980) {
        EC.imageChange('');
      } else if ((windowWidth >= 768) && (windowWidth <= 979)) {
        EC.imageChange('-lds');
      } else if ((windowWidth >= 571) && (windowWidth <= 767)) {
        EC.imageChange('-prt');
      } else if (windowWidth <= 570) {
        EC.imageChange('-hh');
      }
    },

    mobileDevice : function() {
      if (WURFL.complete_device_name === 'Apple iPad') {
        if (window.matchMedia('(orientation : portrait)').matches) {
          EC.imageChange('-prt');
        } else if (window.matchMedia('(orientation : landscape)').matches) {
          EC.imageChange('-lds');
        }
      } else if ((WURFL.form_factor === 'Smartphone')) {
         EC.imageChange('-hh');
      }
    },

    rspImg : function () {
      EC.setSize();
      $(window).smartresize(function() {
        setTimeout(function() {
          EC.setSize();
        }, 200);
      });
      $(window).on('orientationchange', function() {
        setTimeout(function() {
          EC.mobileDevice();
        }, 200);
      });
    },

    cleanDOMPrime : function(selector, index) {
      $(selector).contents()
        .each(function(i, el) {
          if (i === index) $(el).remove();
        });
    },

    cleanDOMSec : function(selector) {
      $(selector).contents()
        .each(function(i, el) {
          if (i !== 0) $(el).remove();
        });
    },

    initCleanDOM : function() {
      $('#benefits_1 .caption').removeClass('invisible');
      $('.caption.invisible')
        .each(function(i, el) {
          $(el).remove();
        });
      var configPrime = [
            {selector: '#problem_2 p.heavy', index: 1},
            {selector: '#implication_2 h4', index: 1},
            {selector: '#implication_2 p.heavy', index: 1},
            {selector: '#trends_2 h4', index: 1},
            {selector: '#trends_2 [data-nodes=challenge]', index: 5},
            {selector: '#answer_2 p.heavy', index: 1},
            {selector: '#benefits_2 h4', index: 1},
            {selector: '#benefits_2 p.heavy', index: 1},
            {selector: '#how_2 h4', index: 1},
            {selector: '#what_2 h4', index: 1}
          ],
          configSec = [
            '#problem_2 [data-nodes=challenge]',
            '#answer_2 [data-nodes=challenge]',
            '#benefits_2 [data-nodes=challenge]',
            '#how_2 [data-nodes=challenge]',
            '#what_2 [data-nodes=challenge]'
          ];

      $.each(configPrime, function(i, el) {
        EC.cleanDOMPrime(el.selector, el.index);
      });

      $.each(configSec, function(i, el) {
        EC.cleanDOMSec(el);
      });
      $('#what_2 .link-container,' +
        '#what_2 [data-nodes=challenge2],' +
        '#how_2 .link-container,' +
        '#how_2 [data-nodes=challenge2],' +
        '#benefits_2 [data-nodes=challenge2],' +
        '#trends_2 [data-nodes=challenge2],' +
        '#problem_2 [data-nodes=challenge2]').remove();
      $('#benefits_2 .link-container').html('<p class="heavy">And it doesn’t take much to get started...</p>');
    },

    iPadFix : function() {
      if (WURFL.complete_device_name === 'Apple iPad') {
        $('[data-links]').on('touchstart', function(ev) {
          $(ev.target).closest('a.inner').trigger('click');
        });
      }
    },

    phoneFix : function() {
      var deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      if ((WURFL.form_factor === 'Smartphone') && (deviceWidth <= 360)) {
          if (deviceWidth === 320) {
            $capeLink.css('width', '290px');
          } else {
            $capeLink.css('width', '320px');
          }
      } else if ((WURFL.form_factor == 'Smartphone') && (deviceWidth <= 640)){
        if (deviceWidth === 568) {
          $capeLink.css('width', '400px');
        } else {
          $capeLink.css('width', '348px');
        }
      }
    },

    phoneInit : function() {
      EC.phoneFix();
      $(window).on('orientationchange', function() {
        setTimeout(function() {
          EC.phoneFix();
        }, 1000);
      });
    },

    init : function() {
      EC.rspImg();
      EC.iPadFix();
      EC.phoneInit();
      EC.pageSpecific();
      EC.modalSetUp();
      EC.onePageNav();
      EC.formatDate();
      EC.setActiveState();
      EC.imageReplace();
      EC.initCleanDOM();
      EC.setForms();
    }
  };
})();
EC.init();
