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


var storedPosts = {};
var editingPost;
var editingPage;
var isPost = true;

var createNewPost = function() {
  $('#editor').html("");
  $('#title').val("");
  $('#username').html(window.otter.user.displayName);
  $('#date').html("now");
	$('#userdetail').show();
	$('#pageslug').hide();
  editingPost = undefined;
	isPost = true;
};


var editPost = function(postId) {
    $('#editor').html(storedPosts[postId].body);
    $('#title').val(storedPosts[postId].title);
	  $('#username').html(storedPosts[postId].authorname);
	  $('#date').html(new Date(storedPosts[postId].timestamp).toDateString());
		$('#userdetail').show();
		$('#pageslug').hide();
    editingPost = postId;
		isPost = true;
};


var createNewPage = function() {
  $('#editor').html("");
  $('#title').val("");
  $('#userdetail').hide();
	$('#pageslug').show();
  editingPage = undefined;
	isPost = false;
};

var editPage = function(pageId) {
    $('#editor').html(storedPages[pageId].body);
    $('#title').val(storedPages[pageId].title);
		$('#userdetail').hide();
		$('#pageslug').show();
    editingPage = pageId;
		isPost = false;
};

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
  })
	.catch(function(err) {

    var postHTML = "<li><a id='createNewPost' href='#'>New post</a></li>";
    $('#postList').html(postHTML);
    $('#createNewPost').click(createNewPost);
	});
};


var updatePageList = function() {
  window.otter.listPages().then(function(pages) {
    storedPages = pages;
    var pageHTML = "<li><a id='createNewPage' href='#'>New page</a></li>";
    for (var pageIndex in pages) {
      pageHTML += "<li><a href='#' onclick='editPage(\""+pageIndex+"\")'>"+pageIndex+"</a></li>";
    }
    $('#pageList').html(pageHTML);
    $('#createNewPage').click(createNewPage);
  });
};

var uploadAPost = function() {
  var title = $('#title').val();
  var body = $('#editor').html();
  var slug = $('#slug').val();
  console.log("editingPost = "+editingPost);
	if (isPost) {
	  if (editingPost) {
	    window.otter.updatePost(editingPost, title, body);
	  } else {
	    window.otter.createNewPost(title, body);
	  }
	} else {
		window.otter.setPage(slug, title, body);
	}
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
updatePageList();

window.otter.addEventListener(BLOGOTTER_NEW_POSTS, function() {
	updatePostList();
	updatePageList();
});
