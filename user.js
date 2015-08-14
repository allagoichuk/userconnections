
// Type 3: Persistent datastore with automatic loading
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'data/users', autoload: true });

var bcrypt = require('bcrypt')
var salt = "$2a$10$IMrVEFxcxkpQoC/Fu57Jt."

// populate admin 
db.find({ name:"root" }, function (err, docs) {
  if (docs.length == 0) { 
      db.insert({ _id: "0", name: "root", password: bcrypt.hashSync("1", salt), isAdmin: true, linkedUsers: [] });
  } });
    
//check if password is valid
exports.validPassword = function(user, password) {
   return user.password == bcrypt.hashSync(password, salt)
}

//find the user by name
exports.findOne = function(name, callback) {
   db.find({ name: name }, function (err, docs) {
       if (docs.length == 0) { 
        callback("User not found", null)
       } else {
        callback(null, docs[0])
       }
    });
}

//add new user to database 
exports.addNew = function(name, password, done)  {
  var user = { name: name, password: bcrypt.hashSync(password, salt), isAdmin: false, linkedUsers: [] }
  db.insert(user, function (err, newDoc) {   
      done(err)
  });
}

//find user by id
exports.findUserById = function(id, callback) {
   db.find({ _id: id }, function (err, docs) {
       if (docs == null) { 
        callback("User not found", null)
       } else {
        callback(null, docs)
       }
    });
}

//find relations for particular user
exports.findRelations = function(me, callback) {
   db.find({ $not: { _id: me._id } } , function (err, docs) {
      var hash = {};
      
      for(var i=0; i< docs.length; i++) {
        var item = { Id: me._id, Email: me.name, OtherId: docs[i]._id, OtherEmail: docs[i].name, IsLinked: false } 
        hash[docs[i]._id] = item;
      }

      for(var i=0; i< me.linkedUsers.length; i++) {
        hash[me.linkedUsers[i]].IsLinked = true
      }

      callback(null, getValues(hash))    
    });
}

//find all realtions, available only for admins
exports.getAllRelations = function(callback) {
   db.find({ } , function (err, docs) {
      var all = [];
      
      var hash = {};
      for(var i=0; i< docs.length; i++) {
        hash[docs[i]._id] = docs[i].name;
      }

      for(var i=0; i< docs.length; i++) {
        for(var k=0; k<docs[i].linkedUsers.length; k++) {
          if (docs[i]._id >= docs[i].linkedUsers[k]) {
            var item = { Id: docs[i]._id, Email: docs[i].name, OtherId: docs[i].linkedUsers[k], 
                         OtherEmail: hash[docs[i].linkedUsers[k]], IsLinked: true } 
            all.push(item)
          }  
        }
      }
      
      callback(null, all)
    });
}

//add new relation for the user
exports.addRelation = function(user, otherId, callback) {
   db.find( { _id: otherId } , function (err, docs) {
      if (docs.length == 0) {
        callback("User not found", false)
      }
              
      if(user.linkedUsers.indexOf(otherId) < 0) {
        db.update({ _id: user._id }, { $push: { linkedUsers: otherId } }, {}, function () {

            if(docs[0].linkedUsers.indexOf(user._id) < 0) {
              db.update({ _id: docs[0]._id }, { $push: { linkedUsers: user._id } }, {}, function () {
                  
                  callback(null)
              })
            }
        })
      }     
    })
} 

//delete relation for the user
exports.deleteRelation = function(user, otherId, callback)  {
   db.find( { _id: otherId } , function (err, docs) {
      if (docs.length == 0) {
        callback("User not found", false)
      }
              
      if(user.linkedUsers.indexOf(otherId) > -1) {
        db.update({ _id: user._id }, { $pull: { linkedUsers: otherId } }, {}, function () {

            if(docs[0].linkedUsers.indexOf(user._id) > -1) {
              db.update({ _id: docs[0]._id }, { $pull: { linkedUsers: user._id } }, {}, function () {
                  
                  callback(null)
              })
            }
        })
      }     
    })
}

//get all values of the hash table
function getValues(hash) {
   var array = []
   
   for(var key in hash) {
      array.push(hash[key])
   }
  return array 
}

