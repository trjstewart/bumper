var mongoose = require('mongoose')
      , Schema = mongoose.Schema
      pingSchema = new Schema( {
          userHash: String,
          dateTime: { type : Date, default: Date.now },
          lat: Number,
          lng: Number,
      }),
Ping = mongoose.model('ping', pingSchema);

module.exports = Ping;