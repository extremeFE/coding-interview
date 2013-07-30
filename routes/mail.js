
var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
    user: "realtime.coding.interview@gmail.com",
    pass: "password"//임시 제거
  }
});

exports.sendMail = function(mail, content){
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: "Realtime Coding Interview ✔ <realtime.coding.interview@gmail.com>", // sender address
    to: mail, // list of receivers
    subject: "코딩 인터뷰 페이지를 생성했습니다.", // Subject line
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
