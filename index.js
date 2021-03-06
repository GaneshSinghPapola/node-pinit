var https = require('https'),
    querystring = require('querystring'),
    isObjectLike = require('lodash/isObjectLike'),
    isString = require('lodash/isString'),
    PDK = require('node-pinterest'),
    isUndefined = require('lodash/isUndefined');



var apiUrl = 'https://api.pinterest.com/oauth/?',
    profileOptions = {
        host: 'api.pinterest.com',
        port: 443,
        method: 'POST'
    },
    
    usrOptions = {};

module.exports = function (options) {
    var module = {};
    if (!isObjectLike(options)) {
        throw new Error('Please pass the options.');
    }


    /**
     * function to validate required options
     * @param {*} optionName 
     */
    function validateOptions(optionName) {
        if (isUndefined(options[optionName])) {
            throw new Error('Please pass required option - ' + optionName);
        }
    }
    validateOptions('redirect_uri');
    validateOptions('client_id');
    validateOptions('client_secret');
    validateOptions('state');

    var redirectionOptions = {
        redirect_uri: options.redirect_uri,
        client_id: options.client_id,
        client_secret: options.client_secret,
        scope: options.scope || 'read_public,read_relationships',
        state: options.state || 'someRandomBytes',
        response_type: 'code'
    };    
    var endUrl = {
        grant_type: 'authorization_code',
        client_id: options.client_id,
        client_secret: options.client_secret,
    }

    /**
     * function to redirect user to pinterest login screen
     * @param {*} req request argument from express
     * @param {*} res response from express
     */
    module.authorization = function (req, res) {
        res.redirect(apiUrl + querystring.stringify(redirectionOptions));
    };

    /**
     *  function to get profile data and access-token from pinterest
     * @param {*} req req request argument from express to get params
     * @param {*} done callback after function is executed
     */
    module.profile = function (req, done) {
        usrOptions['qs'] = {
            fields: options.fields || "id,first_name,last_name,image,url"
        }

        if (req.query.hasOwnProperty('state')) {

            if (req.query.state === options.state) {
                var queryCode = req.query.code;
                if (queryCode !== undefined && queryCode !== '' && queryCode !== null) {

                    endUrl['code'] = queryCode;
                    profileOptions['path'] = '/v1/oauth/token?' + querystring.stringify(endUrl);
                    requestUrl(profileOptions, function (err, data) {
                        if (err) {
                            throw new Error(err);
                        } else {
                            var accessToken = JSON.parse(data).access_token;
                            var pinterest = PDK.init(accessToken);
                            pinterest.api('me', usrOptions)
                                .then(function (pinUserData) {
                                    pinUserData['access_token'] = accessToken;
                                    return done(null, pinUserData);
                                })
                                .catch(function (error) {
                                    return done(error, null);
                                })
                        }
                    })
                }
            } else {
                throw new Error('state does not match')
            }
        } else {
            throw new Error('There is some error occured')
        }
    };
    return module;
}


/**
 * function to make custom https requests
 * @param {*} option requests parameters 
 * @param {*} done callback after api response
 */
function requestUrl(option, done) {
    var fulldata = "";
    var req = https.request(option, function (res) {
        res.on('data', function (d) {
            fulldata += d;
        });
        res.on('end', function () {
            var data = fulldata;
            done(null, data);
        });
    });
    req.end();
    req.on('error', function (e) {
        done(e, null)
    });
}
