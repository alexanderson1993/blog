Portfolio = new Meteor.Collection('portfolio');
photos = new FileCollection('photos',
  { resumable: true,   // Enable built-in resumable.js upload support
  	http: [
  	{ method: 'get',
        path: '/:_id',  // this will be at route "/gridfs/myFiles/:md5"
        lookup: function (params, query) {  // uses express style url params
          return { _id: params._id };       // a query mapping url to myFiles
        }
      }
      ]
    });
if (Meteor.isServer) {
	
  // Only publish files owned by this userId, and ignore
  // file chunks being used by Resumable.js for current uploads
  Meteor.publish('portfolio',
  	function (clientUserId){
  		return Portfolio.find();
  	});
  Meteor.publish('photos',
  	function (clientUserId) {
  		return photos.find();
  	});
  Portfolio.allow({
  	insert: function (userId, file){
  		return true;
  	},
  	remove: function (userId, file){
  		return true;
  	},
  	update: function (userId, file){
  		return true;
  	}
  })
  // Allow rules for security. Should look familiar!
  // Without these, no file writes would be allowed
  photos.allow({
    // The creator of a file owns it. UserId may be null.
    insert: function (userId, file) {
      // Assign the proper owner when a file is created
      file.metadata = file.metadata || {};
      file.metadata.owner = userId;
      return true;
    },
    // Only owners can remove a file
    remove: function (userId, file) {
      // Only owners can delete
      return (userId === file.metadata.owner);
    },
    // Only owners can retrieve a file via HTTP GET
    read: function (userId, file) {
    	return true;
    },
    // This rule secures the HTTP REST interfaces' PUT/POST
    // Necessary to support Resumable.js
    write: function (userId, file, fields) {
      // Only owners can upload file data
      return (userId === file.metadata.owner);
    }
  });
}
if (Meteor.isClient) {
	Router.map(function() {
		this.route('aboutMe', {
			path: '/',
			template: 'aboutMe'
		});
		this.route('portfolio', {
			path: '/portfolio',
			template: 'portfolio'
		});
		return this.route('portfolio-admin', {
			path: '/portfolio-admin',
			template: 'portfolio_admin',
			onBeforeAction: function(pause) {
				if (Meteor.loggingIn()) {
					return pause();
				}
				return Meteor.call('isBlogAuthorized', (function(_this) {
					return function(err, authorized) {
						if (!authorized) {
							return _this.redirect('/blog');
						}
					};
				})(this));
			}
		});
	});
  Blog.config({
    blogIndexTemplate: 'myBlogIndexTemplate',
    blogShowTemplate: 'myShowBlogTemplate',
    comments: {
      disqusShortname: 'alexanderson1993'
    }
  });
  
  Template.blogIndex.rendered = function(){
    $('.full').css('background-image', 'url(/blogback-min.jpg) no-repeat center center fixed;' );
    document.title = "Blog";
    if (Blog.settings.title) {
      return document.title += " | " + Blog.settings.title;
    }
  }
  Template.aboutMe.age = function(){
    oldEnd = new Date().getYear();
    oldBegin = new Date('January 1 1993').getYear();
    var newEnd = oldEnd - oldBegin;
    return newEnd;
  }
  Template.portfolio.portfolios = function(){
    return Portfolio.find();
  }
  Template.portfolio.imagesource = function(){
    return photos.baseURL + "/" + this.fileId;
  }
  Template.portfolio_admin.currentEntry = function(which){
    var entry = Session.get('currentEntry');
    if (entry != ''){
     if (which == 'shown'){
      return true;
    }
    if (which == 'title'){
      return entry.title;
    }
    if (which == 'description'){
      return entry.description;
    }
    if (which == 'imagesource'){
      return photos.baseURL + "/" + entry.fileId;
    }
  }
  else {return false;}
}
Template.portfolio_admin.portfolios = function(){
  return Portfolio.find();
}
Template.portfolio_admin.created = function(){
  Session.set('currentEntry','');
}
Template.portfolio_admin.rendered = function(){
  photos.resumable.assignDrop($(".portfolio_admin"));
}
Template.portfolio_admin.events({
  'click .addEntry': function(e){
   console.log('hello!');
   Session.set('currentEntry','new');
 },
 'click .submitPortfolio': function(e, t){
   photos.resumable.addFile(t.find('#file').files[0], t);

 },
 'click p.portfolio': function(e, t){
   Session.set('currentEntry',this);

 },
 'click .removeEntry': function(e, t){
   Portfolio.remove(Session.get('currentEntry')._id);
   Session.set('currentEntry','');

 }
})
Meteor.startup(function () {
  $('body').addClass('full');

    // When a file is added via drag and drop
    photos.resumable.on('fileAdded', function (file, t) {
    	var obj = {};
    	obj.title = t.find('.titleInput').value;
    	obj.description = t.find('.descriptionInput').value;
    	obj.fileId = file.uniqueIdentifier;
    	Portfolio.insert(obj);

    	Session.set('uploadedFileId',file.uniqueIdentifier);
      // Create a new file in the file collection to upload
      return photos.insert({
        _id: file.uniqueIdentifier,  // This is the ID resumable will use
        filename: file.fileName,
        contentType: file.file.type
      },
        function (err, _id) {  // Callback to .insert
        	if (err) { return console.error("File creation failed!", err); }
          // Once the file exists on the server, start uploading
          return photos.resumable.upload();
        }
        );

    });

    // This autorun keeps a cookie up-to-date with the Meteor Auth token
    // of the logged-in user. This is needed so that the read/write allow
    // rules on the server can verify the userId of each HTTP request.
    Deps.autorun(function () {
      // Sending userId prevents a race condition
      Meteor.subscribe('portfolio');
      Meteor.subscribe('photos');
      return $.cookie('X-Auth-Token', Accounts._storedLoginToken());
      // $.cookie() assumes use of "jquery-cookie" Atmosphere package.
      // You can use any other cookie package you may prefer...
      //$.cookie('X-Auth-Token', Accounts._storedLoginToken());
    });
  });
}

