var MongoClient = require( 'mongodb' ).MongoClient,
    express = require( 'express' ),
    node_acl = require( 'acl' ),
    port = 8000,
    app = express(),
    acl;

// Error handling
app.use( function( error, request, response, next ) {
    if( !error ) return next();
    response.send( error.msg, error.errorCode );
});

// Connecting to our mongo database
MongoClient.connect( 'mongodb://127.0.0.1:27017', _mongo_connected );

function _mongo_connected( error, client ) {

    if (error) throw error;
    console.log("error",error);
    
    var db = client.db('innovify_acl');
    console.log("db",db);

    var mongoBackend = new node_acl.mongodbBackend( db );
    acl = new node_acl( mongoBackend, logger() );

    // roles and routes
    set_roles();
    set_routes();
}

// set of roles
function set_roles() {

    acl.allow([
        {
            roles: 'admin',
            allows: [
                { resources: '/secret', permissions: 'create' },
                { resources: '/topsecret', permissions: '*' }
            ]
        }, {
            roles: 'user',
            allows: [
                { resources: '/secret', permissions: 'get' }
            ]
        }, {
            roles: 'guest',
            allows: []
        }
    ]);

    acl.addRoleParents( 'user', 'guest' );
    acl.addRoleParents( 'admin', 'user' );
}

// routes
function set_routes() {

    // root for all
    app.get( '/', function( request, response, next ) {
            response.send( 'Welcome To ACL!' );
        }
    );

    // overview of permissions
    app.get( '/info',
        function( request, response, next ) {
            acl.allowedPermissions( get_user_id(), [ '/info', '/secret', '/topsecret' ], function( error, permissions ){
                response.json( permissions );
            });
        }
    );

    // for users and higher
    app.get( '/secret', acl.middleware( 1, get_user_id ),
        function( request, response, next ) {
            response.send( 'Welcome Sir!' );
        }
    );

    // for admins
    app.get( '/topsecret', acl.middleware( 1, get_user_id ),
        function( request, response, next ) {
            response.send( 'Hi Admin!' );
        }
    );

    // Setting a new role
    app.get( '/allow/:user/:role', function( request, response, next ) {
        acl.addUserRoles( request.params.user, request.params.role );
        response.send( request.params.user + ' is a ' + request.params.role );
    });

    // Unsetting a role
    app.get( '/disallow/:user/:role', function( request, response, next ) {
        acl.removeUserRoles( request.params.user, request.params.role );
        response.send( request.params.user + ' is not a ' + request.params.role + ' anymore.' );
    });
}


// for authentication base of database entry
function get_user_id( request, response ) {
    return 'mistry';
}

// error show in console
function logger() {
    return {
        debug: function( msg ) {
            console.log( '-DEBUG-', msg );
        }
    };
}

// Starting the server
app.listen( port, function() {
    console.log( 'ACL listening on port ' + port );
});