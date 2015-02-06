
var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "realtime.coding.interview@gmail.com",
    pass: "password"//임시 제거
  }
});

exports.sendMail = function(mail, subject, content){
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: "Coding Interview <realtime.coding.interview@gmail.com>", // sender address
    to: mail, // list of receivers
    subject: subject, // Subject line
    html: content // html body
  }

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message sent: " + response.message);
    }
  });
};
