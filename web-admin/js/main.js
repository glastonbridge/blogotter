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

var isEditingPost = function() {
	isEditingAnything(true);
	$('#userdetail').show();
	$('#pageslug').hide();
	$('#blurb').show();
	isPost = true;
};
var isEditingPage = function() {
	isEditingAnything(true);
	$('#userdetail').hide();
	$('#pageslug').show();
	$('#blurb').hide();
	isPost = false;
};
var isEditingAnything = function(value) {
	console.log("hiding ? "+ value);
	if (value) {
		$('#page-wrapper').show();
	} else {
		$('#page-wrapper').hide();
	}

};

var createNewPost = function() {
  $('#editor').html("");
  $('#title').val("");
  $('#username').html(window.otter.user.displayName);
  $('#date').html("now");
	$('#blurb').val("");
	$('#thumb').val("");

  editingPost = undefined;
	isEditingPost();
};


var editPost = function(postId) {
    $('#editor').html(storedPosts[postId].body);
    $('#title').val(storedPosts[postId].title);
	  $('#username').html(storedPosts[postId].authorname);
	  $('#date').html(new Date(storedPosts[postId].timestamp).toDateString());
		$('#blurb').val(storedPosts[postId].blurb);
		$('#thumb').val(storedPosts[postId].thumb);
	  editingPost = postId;
		isEditingPost();
};


var createNewPage = function() {
  $('#editor').html("");
  $('#title').val("");
  editingPage = undefined;
	isEditingPage();
};

var editPage = function(pageId) {
    $('#editor').html(storedPages[pageId].body);
    $('#title').val(storedPages[pageId].title);
    editingPage = pageId;
		isEditingPage();
};

var updatePostList = function() {
  window.otter.latestPosts({limit:"all"}).then(function(posts) {
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
	var thumb = $('#thumb').val();
  var body = $('#editor').html();
  var blurb = $('#blurb').val();
  console.log("editingPost = "+editingPost);
	if (isPost) {
	  if (editingPost) {
	    window.otter.updatePost(editingPost, {title: title, body: body, blurb: blurb, thumb:thumb});
	  } else {
	    window.otter.createNewPost({title: title, body: body, blurb: blurb, thumb:thumb});
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

$('#thumb').change(function() {
	$('#thumbprev').attr('src',$('#thumb').val());
});

$('#editor').change(function() {
	$('#editorPlain').val($('#editor').html());
});

$('#editorPlain').change(function() {
	$('#editor').html($('#editorPlain').val());
});

window.otter.addEventListener(BLOGOTTER_AUTH_CHANGED, function(event) {
  updateUserInfo();
});

updateUserInfo();
updatePostList();
updatePageList();
isEditingAnything(false);

window.otter.addEventListener(BLOGOTTER_NEW_POSTS, function() {
	updatePostList();
	updatePageList();
});
