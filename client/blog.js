



if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}

if (Meteor.isClient) {
Router.map(function () {

     this.route('aboutMe', {
         path: '/',
         template: 'aboutMe'
     });

     this.route('portfolio', {
         path: '/portfolio',
         template: 'portfolio'
     });

});

  Meteor.startup(function () {
      $('body').addClass('full');
      Blog.config
});
      Template.navigator.events = {
        'click .portfolio': function(e) {
         
        document.getElementById("main").setAttribute("style","display:none"); 
        document.getElementById("portfolio").setAttribute("style","display:block");
          },
        'click .aboutMe': function(e) {
        
        document.getElementById("main").setAttribute("style","display:block"); 
        document.getElementById("portfolio").setAttribute("style","display:none");
          } 
      };

  Blog.config({
  blogIndexTemplate: 'myBlogIndexTemplate',
  blogShowTemplate: 'myBlogShowTemplate'
});
    
}

