var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mySchema = Schema({ title: String, content: String });

var uri = 'mongodb://codinginterview:123456@dharma.mongohq.com:10005/CodingInterview';
var db = mongoose.createConnection(uri);

module.exports = db.model('question', mySchema);