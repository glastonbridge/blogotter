const BLOGOTTER_NEW_POSTS = 456001;
const BLOGOTTER_AUTH_CHANGED = 456002;

/**
 * You should construct Firebase prior to loading this script, as per the
 * instructions on the Firebase console.
 * config is an optional parameter, it can optionally contain:
 *     signinProvider (default:firebase.auth.GoogleAuthProvider)
 */
function BlogOtter(config) {
    if (!config) config = {};
    this.config = JSON.parse(JSON.stringify(config));
    if (!this.config.signinProvider)
        this.config.signinProvider = firebase.auth.GoogleAuthProvider;

    this.initFirebase();
}


// Sets up shortcuts to Firebase features and initiate firebase auth.
BlogOtter.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

BlogOtter.prototype.requestLogin = function() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new this.config.signinProvider();
    this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
BlogOtter.prototype.requestLogout = function() {
    // Sign out of Firebase.
    this.auth.signOut();
};

BlogOtter.prototype.onAuthStateChanged = function(user) {
    this.user = user;
    this.dispatchEvent({
        type: BLOGOTTER_AUTH_CHANGED,
        message: user
    });
};

BlogOtter.prototype.createNewPost = function(title, body) {
    var self = this;
    return this.database.ref('posts').push({
        //name: this.user.displayName,
        title: title,
        body: body,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        author: this.user.uid
    }).then(function() {
        self.dispatchEvent(BLOGOTTER_NEW_POSTS);
    }).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
    });
};

BlogOtter.prototype.updatePost = function(key, title, body) {
    var self = this;
    return this.database.ref('posts').child(key).set({
        //name: this.user.displayName,
        title: title,
        body: body
    }).then(function() {
        self.dispatchEvent(BLOGOTTER_NEW_POSTS);
    }).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
    });
};

BlogOtter.prototype.latestPosts = function() {
    var self = this;
    return new Promise(function(res, rej) {
        var users = self.database.ref('users');
        self.database.ref('posts')
            .limitToLast(12)
            .once('value', function(posts) {
                var results = posts.val();
		            var toProcess = Object.keys(results).length;
                var nameGetter = function(postId, username) {
                    results[postId].authorname = username.val();
                    --toProcess;
                    if (toProcess === 0) {
                        res(results);
                    }
                };
                for (var postId in results) {
                    users.child(results[postId].author + "/friendlyname").once('value', nameGetter.bind(self,postId));
                }
            });
    });
};


BlogOtter.prototype.setPage = function(slug, title, body) {
    var self = this;
		console.log(JSON.stringify({
				slug: 'pages/'+slug,
        title: title,
        body: body,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        author: this.user.uid
    }));
    return this.database.ref('pages/'+slug).set({
        title: title,
        body: body,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        author: this.user.uid
    }).then(function() {
        self.dispatchEvent(BLOGOTTER_NEW_POSTS);
    }).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
    });
};

/**
 * TODO: gets all the pages... ugh.  Don't do this
 */
BlogOtter.prototype.listPages = function() {
    var self = this;
    return new Promise(function(res, rej) {
        var users = self.database.ref('users');
        self.database.ref('pages')
            .once('value', function(posts) {
                var results = posts.val();
									if (!results) {
										res({});
										return;
									}
		            var toProcess = Object.keys(results).length;
                var nameGetter = function(postId, username) {
                    results[postId].authorname = username.val();
                    --toProcess;
                    if (toProcess === 0) {
                        res(results);
                    }
                };
                for (var postId in results) {
                    users.child(results[postId].author + "/friendlyname").once('value', nameGetter.bind(self,postId));
                }
            });
    });
};


Object.assign(BlogOtter.prototype, EventDispatcher.prototype);
