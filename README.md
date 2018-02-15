# node-pinit
This module is used to authenticate a pinterest account and simply fetch user's details and an access-token from pinterest account.
Before using this module you must register an app in your [Pinterest](https://developers.pinterest.com/apps/) developer account.


## Installation

`npm i --save node-pinit`


## Usage

In nodejs file

```
var Pinterest  = require('node-pinit');

var options = {
  redirect_uri: 'your redirection url given by pinterest',
  client_id: 'your app id given by pinterest', 
  client_secret: 'your app secret given by pinterest',
  scope: "read_public,write_public,read_relationships,write_relationships", //given in pinterest docs
  state: 'randombytes', // a random string
  fields:'id,first_name,last_name,image,url' //fields for profile info
};

var pinterest = new Pinterest(options);

app.get('/pins', pinterest.authorization); //route to open pinterest login

app.get('/auth/pins/callback', function (req, res, next) { //this route should match with your redirect_uri in options
  pinterest.profile(req, function (error, data) {
    // your profile data with access token
    console.log(data);
    res.send(data);
  })
})

```

