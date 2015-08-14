module.exports = function (app, passport, localStrategy, user) {

  passport.serializeUser(function(user, done) {
      done(null, user._id)
  })
  passport.deserializeUser(function(id, done) {
     user.findUserById(id, function(err, usr) {
          done(err, usr[0])
     })
  })
  
  passport.use(new localStrategy(
    function(username, password, done) {
      user.findOne(username, function (err, usr) {
        if (err || !usr || !user.validPassword(usr, password)) {
          return done(null, false, "User not found" );
        }
        return done(null, usr);
      });
    }
  ));
  
  // login
  app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err || !user) { 
        res.status(401).end()
        return
      }
      req.logIn(user, function(err) {
        if (err) { res.status(401).end() }
        return res.status(200).end()
      });
    })(req, res, next);
  });
  
  // logout
  app.post('/api/account/logout', function(req, res){
    req.logout()
    req.session.destroy()
    return res.status(200).end()
  });
  
  // register
  app.post('/api/account/register/', function (req, res) {
    var usr = req.body;
    if (usr.Password != usr.ConfirmPassword) {
      res.status(400).send('Bad Request');
      return;
    }
    
    user.findOne(usr.Email, function (err, existing) {
        if (existing) { 
          res.status(400).send('Bad Request');
          return;
        }
  
        user.addNew(usr.Email, usr.Password, function (err) {
          if (!err) {
            res.status(200).end()
            return
          }
          
          res.status(400).send('Bad Request');
          return;
        })
      })
    
  });
  
  // check if it is an admin
  app.get('/api/account/isadmin/', function (req, res) {
      var usr = req.user
      if (usr == null) {
        res.status(401).end()
        return
      }
      res.json(usr.isAdmin)
  });
  
  // get relations for the user
  app.get('/api/relations/', function (req, res) { 
      var usr = req.user
      if (usr == null) {
        res.status(401).end()
        return
      }
      
      user.findRelations(usr, function (err, relations) {
          if (err) {
            res.status(500).send('Internal server error');
            return
          }
          
          res.json(relations)
      })
  })
  
  // get all relations as admin
  app.get('/api/relations/all', function (req, res) { 
      var usr = req.user
      if (usr == null || !usr.isAdmin) {
        res.status(401).end()
        return
      }
      
      user.getAllRelations(function (err, relations) {
          if (err) {
            res.status(500).send('Internal server error');
            return
          }
          
          res.json(relations)
      })
  })
  
  // add relation
  app.post('/api/relations/:other_id', function (req, res) {
      var usr = req.user
      if (usr == null) {
        res.status(401).end()
        return
      }
  
      user.addRelation(usr, req.params.other_id, function (err) {
          if (err) {
            res.status(500).send('Internal server error');
            return
          }
          res.status(200).end() 
      })
  })
  
  // delete relation
  app.delete('/api/relations/:other_id', function (req, res) {
      var usr = req.user
      if (usr == null) {
        res.status(401).end()
        return
      }
  
      user.deleteRelation(usr, req.params.other_id, function (err) {
          if (err) {
            res.status(500).send('Internal server error');
            return
          }
          res.status(200).end() 
      })
  })
}