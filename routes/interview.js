
/*
 * GET home page.
 */

var model = require('./questionModel');

exports.interview = function(req, res){
  model.find(function (err, docs) {
    if (err) return next(err);
    res.send({ title: docs[0].title, content: docs[0].content });
  });
};