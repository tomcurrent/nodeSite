var ModalModule = (function() {
  'use strict';
  return {
    setSession : function(key, data) {
      data = JSON.stringify(data);
      window.sessionStorage.setItem(key, data);
    },

    getSession : function(key) {
      var data = JSON.parse(window.sessionStorage.getItem(key));
      return data;
    },

    destroyModal : function(selector) {
      if ($(selector + ' [data-js=header]').length > 1) {
        $(selector + ' [data-js=header]').each(function(i, el) {
          if (i === 0 ) $(el).remove();
        });
      }
      if ($(selector + ' [data-js=body]').length > 1) {
        $(selector + ' [data-js=body]').each(function(i, el) {
          if (i === 0 ) $(el).remove();
        });
      }
      if ($(selector + ' [data-js=footer]').length > 1) {
        $(selector + ' [data-js=footer]').each(function(i, el) {
          if (i === 0 ) $(el).remove();
        });
      }
      setTimeout(function() {
        $('[data-append=modal-blog]').scrollTop(0)
      }, 400);
    },

    setTemplate : function(content, data, appendTo, title, selector) {
      var _this = this;
      $.each(data, function(i, el) {
        var dataTitle = el.title.toLowerCase();
        if (dataTitle === title) {
          var template = Handlebars.compile(content),
              html = template(el);
            appendTo.append(html);
            _this.destroyModal(selector);
          return;
        }
      });
    },

    getData : function(content, dataUrl, appendTo, title, selector, key) {
      var session = this.getSession(key),
          _this = this;
      session = JSON.parse(session);
      if (session) {
        this.setTemplate(content, session, appendTo, title, selector);
        console.log('session');
      } else {
        $.ajax({
          url: dataUrl,
          method: 'GET',
          dataType: 'json',
          success: function (data) {
            _this.setTemplate(content, data, appendTo, title, selector);
            _this.setSession(key, JSON.stringify(data));
            console.log('request');
          },
          error: function(jqxhr) {
            console.log(jqxhr.statusText);
          }
        });
      }
    }
  }
})();
