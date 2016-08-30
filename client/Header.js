import '/imports/ui/stylesheets/layout.css';
import '/imports/ui/stylesheets/custom.css';
import '/imports/ui/stylesheets/simple-line-icons.css';
import { App } from '/imports/ui/js/app';
import { Layout } from '/imports/ui/js/layout';

Template.Header.onRendered(()=>{
  App.init();
  Layout.init();
});