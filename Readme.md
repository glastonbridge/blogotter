# BlogOtter, a friendly blog backend for you to write a frontend for

![BlogOtter logo](res/otter.png)

I wanted a blog and I wanted to write my own theme. I don't like hacking Wordpress (I've done enough Wordpress thanks).

I needed a backend.

## Features

1. Serves up posts on a simple interface

```
otter.latestPosts().then(function(posts) {

})
```

2. Provides a default Wordpress-like editor that's nice to use for a non-techy.

3. Has an administrator account that can post when authenticated.

4. Is simple.

## Installation (the least simple part)

1. Log in to https://console.firebase.google.com

2. Click `Create a new project` and call it BlogOtter.

3. Click `Add FireBase to your web app`.

4. Copy the values supplied, and paste them in `web-admin/index.html`, right underneath where it says `<!-- Firebase -->`

5. Set up a local webserver, running from the `web-admin` directory. On \*nix systems, I like to use Python's SimpleHTTPServer
```
cd path-to-repo/blogotter/web-admin
python -m SimpleHTTPServer
```
6. Open up the new locally-hosted webpage in your browser.  If you're using SimpleHTTPServer with no additional settings, it will be at http://localhost:8000

7. Click the little human figure in the top-right corner of the page, and log in.  By default, we use Google Auth because you will need it anyway for the Firebase account.

8. Follow the auth instructions.

9. Click the little human figure again, you will see a text box containing a string of letters and numbers.  That's your login UID, and you will need it to set yourself up as an administrator of your new blog.

10. Open up the file `firebase/initial-data.json` and paste your ID in place of the text `myuid`

11. Return to https://console.firebase.google.com and your BlogOtter project.  Click `Database` on the left-hand side and then click the overflow button on the far right on the big text area.

12. Click `Import JSON` and navigate to `firebase/initial-data.json`.  It will upload the user tree to the app.

13. Open up the rules file `firebase/database-rules.json` in a text editor.  Select everything, and copy it.

13. Back on the Firebase Console, click `Rules` and paste in your rules.  Click `Publish`, now your database is secure.

14. You can now host your site anywhere.  Just make sure that you add the same Firebase details to your new webpage as you added in step 4, and that you also include `blogotter.js`.
