# node_acl
Manage role and permission ( ACL )

Usage:
	1. Install dependency ( npm install )
	2. Start this as server
	3. Play with the resoures

Show all permissions (as JSON)
	http://localhost:8000/info

Only visible for users and higher
	http://localhost:8000/secret

Only visible for admins
	http://localhost:8000/topsecret

Manage roles
	user is 'mistry' and role is either 'guest', 'user' or 'admin'
		http://localhost:8000/allow/:user/:role
		http://localhost:8000/disallow/:user/:role
