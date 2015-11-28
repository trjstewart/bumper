var mongoose = require('mongoose')
      , Schema = mongoose.Schema
      stiSchema = new Schema( {
          name: String,
          period: String,
      }),
Sti = mongoose.model('sti', stiSchema);

module.exports = Sti;