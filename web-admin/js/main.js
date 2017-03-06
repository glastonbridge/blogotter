window.otter = new BlogOtter({

});

$("#editor").wysiwyg();

$(".dropdown-menu > input").click(function (e) {
      e.stopPropagation();
  });

var updateUserInfo = function() {
  if (window.otter.user) {
    $(".userDetails").show();
    $("#userDetailText").html(window.otter.user.displayName);
    $("#userDetailUID").val(window.otter.user.uid);
    $('#userLogInOut').html("Log out");
  } else {
    $(".userDetails").hide();
    $('#userLogInOut').html("Log in");
  }
};

var createNewPost = function() {
  $('#editor').html("");
  $('#title').val("");
  editingPost = undefined;
};

var storedPosts = {};
var editingPost;

var editPost = function(postId) {
    $('#editor').html(storedPosts[postId].body);
    $('#title').val(storedPosts[postId].title);
    editingPost = postId;
}

var updatePostList = function() {
  window.otter.latestPosts().then(function(posts) {
    storedPosts = posts;
    var postHTML = "<li><a id='createNewPost' href='#'>New post</a></li>";
    for (var postIndex in posts) {
      var post = posts[postIndex];
      postHTML += "<li><a href='#' onclick='editPost(\""+postIndex+"\")'>"+post.title+"</a></li>";
    }
    $('#postList').html(postHTML);
    $('#createNewPost').click(createNewPost);
  });
};

var uploadAPost = function() {
  var title = $('#title').val();
  var body = $('#editor').html();
  console.log("editingPost = "+editingPost);
  if (editingPost) {
    window.otter.updatePost(editingPost, title, body);
  } else {
    window.otter.createNewPost(title, body);
  }

  updatePostList();
};

$('#userLogInOut').click(function(e) {
  if (window.otter.user) {
    console.log("Trying to log out");
    window.otter.requestLogout();
  } else {
    console.log("Trying to log in");
    window.otter.requestLogin();
  }
});

$('#saveButton').click(uploadAPost);

window.otter.addEventListener(BLOGOTTER_AUTH_CHANGED, function(event) {
  updateUserInfo();
});

updateUserInfo();
updatePostList();
