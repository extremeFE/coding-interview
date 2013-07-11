var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mySchema = Schema({ title: String, content: String });

var uri = 'mongodb://localhost/CodingInterview';
var db = mongoose.createConnection(uri);
// db is global
module.exports = db.model('question', mySchema);