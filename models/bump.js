var mongoose = require('mongoose')
      , Schema = mongoose.Schema;
      bumpSchema = new Schema( {
          user1: String,
          user2: String,
          distance: Number,
          centerX: Number,
          centerY: Number,
          dateTime: { type : Date, default: Date.now }
      });
Bump = mongoose.model('bump', bumpSchema);

module.exports = Bump;