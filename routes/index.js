var express = require('express'),
    router = express.Router(),
    nodemailer = require('nodemailer'),
    smtpTransport = nodemailer.createTransport('SMTP', {

    // TODO map thru mail.tahoepartners.com (have IT set up account [in progress])
      service: 'Gmail',
      auth: {user: 'tomsolyan@gmail.com', pass: '415kitten' }
    }),
    from = 'Thomas Solyan <tomsolyan@gmail.com>',
    to = 'Thomas Solyan <tsolyan@tahoepartners.com>';

router.get('/', function(req, res) {
    res.render('index', { title: 'ec-microsite' });
});

router.get('/it-dev', function(req, res) {
  var db = req.db,
      collection = db.get('itData');
  collection.find({},{},function(e, docs){
    res.render('main', {
      title: 'IT - Site',
      ecData : docs // itData
    });
  });
});

router.get('/owner', function(req, res) {
  var db = req.db,
      collection = db.get('ownData');
  collection.find({},{},function(e, docs){
    res.render('main', {
      title: 'Owner - Site',
      ecData : docs // ownerData
    });
  });
});

router.get('/contact', function(req, res) {
  var db = req.db,
      contact = db.get('contact');
  contact.find({},{},function(e, docs) {
    res.render('contact', { 
      title: 'EC Contact List',
      contactData : docs
    });
  });
});

router.get('/subscribe', function(req, res) {
  var db = req.db,
      subscribe = db.get('subscribe');
  subscribe.find({},{},function(e, docs) {
    res.render('subscribe', { 
      title: 'EC Subscribe List',
      subscribeData : docs
    });
  });
});

router.get('/report', function(req, res) {
  var db = req.db;
      report = db.get('report');
  report.find({},{},function(e, docs) {
    res.render('report', { 
      title: 'EC Report',
      reportData : docs
    });
  });
});

router.get('/admin', function(req, res) {
  var db = req.db;
      adminUsers = db.get('adminUsers');
  adminUsers.find({},{},function(e, docs) {
    res.render('admin', { 
      title: 'EC Admin',
      userData : docs
    });
  });
});

router.post('/admin', function (req, res) {
  var type = req.body.type,
      userName = req.body.userName,
      passWord = req.body.password,
      stamp = req.body.stamp,
      db = req.db,
      adminUsers = db.get('adminUsers'),
      user,
      pass;

  if (type === 'newuser') {
    adminUsers.find({username: userName}, function(err, obj) { 
      obj.forEach(function(i) {
        res.end('username');
      });
    });

    adminUsers.insert({
      'username' : userName,
      'password' : passWord,
      'time' : stamp
      },
      function (err) {
        (err) ? res.end('304') : res.end('200');
    });
  }

  if (type === 'login') {
    adminUsers.find({username: userName}, function(err, obj) { 
      obj.forEach(function(i) {
        user = true;
      });
    });

    adminUsers.find({password: passWord}, function(err, obj) { 
      obj.forEach(function(j) {
        pass = true;
      });
    });

    setTimeout(function() {
      if (user && pass) {
        res.end('200');
      } else if (user && !pass) {
        res.end('304');
      } else if (!user) {
        res.end('305');
      }
    }, 1000);
  }
});

router.post('/it-dev', function (req, res) {
  var type = req.body.type,
      firstName = req.body.firstName,
      lastName = req.body.lastName,
      email = req.body.email,
      phone = req.body.phone,
      message = req.body.message,
      reason = req.body.reason,
      inqType = req.body.inqType,
      company = req.body.company,
      stamp = new Date(),
      db = req.db,
      contact = db.get('contact'),
      subscribe = db.get('subscribe'),
      report = db.get('report');

  switch(type) {
    case 'contact':
      contact.insert({
        'firstName' : firstName,
        'lastName' : lastName,
        'email' : email,
        'phone' : phone,
        'message' : message,
        'reason' : reason,
        'time' : stamp
        },
        function (err) {
          (err) ? res.end('{"error" : "Contact Write Error", "status" : 304}') : console.log('contact write success');
      });

      smtpTransport.sendMail({
        from: from,
        to: to,
        subject: 'Contact Request',
        text: 'This is a Contact Request from ec-nodesite\n' +
          'From: ' + firstName + ' ' + lastName + '\n' +
          'Email: ' + email + '\n' +
          'Phone: ' + phone +'\n' +
          'Inquiry Type: ' + reason + '\n\n' +
          'Message: ' + message,
        },
        function(error, response) {
          if (error) {
            res.end('{"error" : "Update Error", "status" : 503}');
          } else {
            console.log('Contact Request Sent: ' + response.message);
            smtpTransport.sendMail({
              from: from,
              to: firstName + ' ' + lastName + ' <' + email + '>',
              subject: 'Contact Request Recieved from TahoePartners',
              text: 'This is an automated response to your Contact Request. Below is the contact information we recieved from our site:\n' +
                'From: ' + firstName + ' ' + lastName + '\n' +
                'Email: ' + email + '\n' +
                'Phone: ' + phone +'\n' +
                'Inquiry Type: ' + reason + '\n\n' +
                'Message: ' + message +  '\n\n' +
                'Someone at TahoePartners will  contact you ASAP with the information you requested. Thank You!'
              },
              function(error, response) {
                (error) ? res.end('{"error" : "Update Error", "status" : 503}') : res.end('{"success" : "Updated Successfully", "status" : 250}');
            });
          }
        }
      );
      break;
    case 'subscribe':
      subscribe.insert({
        'firstName' : firstName,
        'lastName' : lastName,
        'email' : email,
        'inqType' : inqType,
        'time' : stamp
        },
        function (err) {
          (err) ? res.end('{"error" : "Subscribe Write Error", "status" : 304}') : console.log('subscribe write success');
      });

      smtpTransport.sendMail({
        from: from,
        to: to,
        subject: 'Blog Subscription',
        text: 'This is a Blog Subscription Request from ec-nodesite\n' +
          'From: ' + firstName + ' ' + lastName + '\n' +
          'Email: ' + email + '\n' +
          'Inquiry Type: ' + inqType + '\n\n'
        }, 
        function(error, response) {
          if (error) {
            res.end('{"error" : "Update Error", "status" : 503}');
          } else {
            console.log('Blog Subscription Request Sent: ' + response.message);
            smtpTransport.sendMail({
              from: from,
              to: firstName + ' ' + lastName + ' <' + email + '>',
              subject: 'Blog Subscription Request Recieved from TahoePartners',
              text: 'This is an automated response to your Blog Subscription Request. Below is the contact information we recieved from our site:\n' +
                'From: ' + firstName + ' ' + lastName + '\n' +
                'Email: ' + email + '\n' +
                'Inquiry Type: ' + inqType + '\n\n' +
                'Someone at TahoePartners will  contact you ASAP with the information you requested. Thank You!'
              },
              function(error, response) {
                (error) ? res.end('{"error" : "Update Error", "status" : 503}') : res.end('{"success" : "Updated Successfully", "status" : 250}');
            });
          }
        }
      );
      break;
    case 'report':
      report.insert({
        'firstName' : firstName,
        'lastName' : lastName,
        'email' : email,
        'company' : company,
        'time' : stamp
        }, 
        function (err) {
          (err) ? res.end('{"error" : "Report Write Error", "status" : 304}') : console.log('report write success');
      });

      smtpTransport.sendMail({
        from: from,
        to: to,
        subject: 'Report Request',
        text: 'This is a Blog Report Request from ec-nodesite\n' +
          'From: ' + firstName + ' ' + lastName + '\n' +
          'Email: ' + email + '\n' +
          'Company Name: ' + company + '\n\n'
        },
        function(error, response) {
          if (error) {
            res.end('{"error" : "Update Error", "status" : 503}');
          } else {
            console.log('Report Request Sent: ' + response.message);
            smtpTransport.sendMail({
              from: from,
              to: firstName + ' ' + lastName + ' <' + email + '>',
              subject: 'Report Request Recieved from TahoePartners',
              text: 'This is an automated response to your Report Request. Below is the contact information we recieved from our site:\n' +
                'From: ' + firstName + ' ' + lastName + '\n' +
                'Email: ' + email + '\n' +
                'Company Name: ' + company + '\n\n' +
                'Someone at TahoePartners will  contact you ASAP with the information you requested. Thank You!'
              },
              function(error, response) {
                (error) ? res.end('{"error" : "Update Error", "status" : 503}') : res.end('{"success" : "Updated Successfully", "status" : 250}');
            });
          }
        }
      );
      break;
    default:
      break;
  }
});
module.exports = router;
