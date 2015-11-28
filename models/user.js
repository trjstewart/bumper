var mongoose = require('mongoose')
      , Schema = mongoose.Schema
      userSchema = new Schema( {
          userHash: String,
          gender: String,
          age: Number,
          profile: { type : Array , "default" : [] }
      }),
User = mongoose.model('user', userSchema);

module.exports = User;