export const setupPapertrail = () => {

  let host = Meteor.settings.Papertrail.host;
  let port = Meteor.settings.Papertrail.port;

//creating a global server logger
  logger = Winston;

  logger.add( Winston_Papertrail, {
    levels: {
      debug: 0,
      info:  1,
      warn:  2,
      error: 3,
      auth:  4
    },
    colors: {
      debug: 'blue',
      info:  'green',
      warn:  'red',
      error: 'red',
      auth:  'red'
    },

    host:             host ? host : 'localhost',
    port:             port ? port : '1234', // this change from papertrail account to account
    handleExceptions: true,
    json:             true,
    colorize:         true,
    logFormat:        function ( level, message ) {
      return '[' + level + '] ' + message;
    }
  } );

  logger.info( " =====> Trips restarted " + new Date( Date.now() ) + " <=====" );
}