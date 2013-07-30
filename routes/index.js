
/*
 * GET home page.
 */

var model = require('./interviewModel');

exports.index = function(req, res){
  model.find(function (err, docs) {
    if (err) return next(err);
    res.render('index', { title: docs[0].title, content: encodeURIComponent(docs[0].content) });
  });
};