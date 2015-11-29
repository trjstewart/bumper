var mongoose = require('mongoose')
      , Schema = mongoose.Schema
      reportSchema = new Schema( {
          userHash: String,
          sti: String,
          days: Number,
          dateTime: { type : Date, default: Date.now },
      }),
Report = mongoose.model('report', reportSchema);

module.exports = Report;