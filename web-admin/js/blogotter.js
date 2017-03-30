const BLOGOTTER_NEW_POSTS = 456001;
const BLOGOTTER_AUTH_CHANGED = 456002;

var validateOpts = function(toValidate, optList) {
	for (var optIndex in optList) {
		var opt = optList[optIndex];
		if (!toValidate.hasOwnProperty(opt)) {
			throw new Error("Option missing: "+opt+", in: "+JSON.stringify(toValidate));
		}
	}
};

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

BlogOtter.prototype.createNewPost = function(options) {
	validateOpts(options, ["title","body"]);
    var self = this;
		console.log("opts: "+options);
		var sanitisedOptions = {
        title: options.title,
        body: options.body,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        author: this.user.uid
    };
		var optionals = ["blurb","thumb"];
		for (var optI in optionals) {
			var option = optionals[optI];
			if (options.hasOwnProperty(option)) {
				sanitisedOptions[option] = options[option];
			}
		}
    return this.database.ref('posts').push(sanitisedOptions).then(function() {
        self.dispatchEvent(BLOGOTTER_NEW_POSTS);
    }).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
    });
};

BlogOtter.prototype.updatePost = function(key, options) {
    var self = this;
		validateOpts(options, ["title","body"]);
		console.log("opts: "+options);
		var sanitisedOptions = {
        title: options.title,
        body: options.body,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        author: this.user.uid
    };
		var optionals = ["blurb","thumb"];
		for (var optI in optionals) {
			var option = optionals[optI];
			if (options.hasOwnProperty(option) && options[option] != undefined) {
				sanitisedOptions[option] = options[option];
			}
		}
    return this.database.ref('posts').child(key).set(sanitisedOptions)
		.then(function() {
        self.dispatchEvent(BLOGOTTER_NEW_POSTS);
    }).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
    });
};

BlogOtter.prototype.latestPosts = function(options) {
		if (!options) {
			options = {};
		}
		if (!options.limit) {
			options.limit = 12;
		}
    var self = this;
    return new Promise(function(res, rej) {
        var users = self.database.ref('users');
        var ref = self.database.ref('posts')
				if (options.limit != "all") {
					ref = ref.limitToLast(options.limit);
				}
        ref.once('value', function(posts) {
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
								var nameFailed = function(err) {
									--toProcess;
									console.log("couldn't resolve user");
								};
                for (var postId in results) {
									console.log("looking for "+postId + " by "+results[postId].author);
                    users.child(results[postId].author + "/friendlyname").once('value', nameGetter.bind(self,postId))
										.catch(nameFailed);
                }
            })
						.catch(function(err) {
							console.log("ERROR: "+err);
							rej(err);
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
