
/*
 * GET home page.
 */

var mongo = require('mongodb');

exports.index = function(req, res){
  var server = new mongo.Server("localhost", 27017);
  var client = new mongo.Db('CodingInterview', server, {w:-1});
  client.open(function(err, client){
    if (err) { throw err; }
    var collection = new mongo.Collection(client, 'question');
    var cursor = collection.find();
    cursor.count(function(err, count){
      var message;
      if (count === 0) {
        client.close();
        res.render('index', { title: '', content: '' });
        return;
      }

      cursor.toArray(function(err, doc) {
        client.close();
        console.log(doc[0].content)
        res.render('index', { title: doc[0].title, content: doc[0].content });
      });
    });
  });


};