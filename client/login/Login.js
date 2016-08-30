Template.LoginContent.onRendered(()=>{
  $('body').addClass('login');
  import '/imports/ui/stylesheets/login.css';
  import Login from  '/imports/ui/js/login';

  Login.init();
});