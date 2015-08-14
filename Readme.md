# Users test project

To run requires Node.js installed on a computer. A few popular libraries are used: 
'express.js' as a web-server and a bunch of middleware to implement RESTful service, 
'passport.js' for users identification, 
'nedb' as a simple file-based nosql datastore,
'bcrypt' to hash passwords

Basic user model extended with list of linked user Ids for the purpose of this project. Simplest html page as a client for the REST service. 

Datastore will be created on the fly, seeded with 'root' user with password '1'

## Deployment

* clone repository
* restore dependencies: run command  "npm install" in the root folder of the project
* run the project: "node server.js"
* open browser with initial url http://localhost:3000/home.html
 
