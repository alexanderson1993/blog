



if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}

if (Meteor.isClient) {

  Meteor.startup(function () {
      $('body').addClass('full');
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
}

