import casual from 'casual-browserify';
export const fillForms = ()=>{
  const password = casual.password;
  $("[name='firstname']").val(casual.first_name);
  $("[name='lastname']").val(casual.last_name);
  $("[name='phone']").val(casual.phone);
  $("[name='address']").val(casual._address1());
  $("[name='city']").val(casual.city);
  $("[name='state']").val(casual.state_abbr);
  $("[name='zip']").val(casual.zip);
  $("[name='email']").val(casual.email);
  $("[name='password']").val(password);
  $("[name='rpassword']").val(password);
  $('[name="tnc"]').prop('checked', true);
};

export const updateForm = (formInfo)=>{
  Meteor.call("update.form", formInfo, function(err, res){
    if(err) console.error(err);
    else console.log(res);
  });
};

export const fillFormData = (formData)=>{
  formData.forEach(function ( field ) {
    if(field && field.value){
      if($("[name='" + [field.name] + "']").is(':radio') || $("[name='" + [field.name] + "']").is(':checkbox')) {
        console.log("this is a radio field");
        $("input[name='" + [field.name] + "'][value='" + [field.value] + "']").prop("checked",true);
      } else {
        $("[name='" + [field.name] + "']").val(field.value);
        $("[name='" + [field.name] + "']").addClass("edited");
      }
    }
  });
};

export const statuses = {
  inProgress:             '<span class="text-right" style="color: orange;"><i class="btn-lg btn-icon-only icon-hourglass"></i> In-progress</span>',
  completed:              '<span class="text-right text-success"> <i class="btn-icon-only btn-lg icon-check"></i> Completed</span>',
  notStarted:             '<span class="text-right" style="color: orangered;"><i class="btn-icon-only btn-lg icon-ban"></i> Not Started</span>',
  waitingForRegistration: '<span class="text-right" style="color: orangered;"><i class="btn-icon-only btn-lg icon-ban"></i> Waiting for Trip Registration</span>'
};


export const getRaisedTotal = (userId)=>{
  let total = 0;
  if(Roles.userIsInRole(Meteor.userId(), 'admin')){
    let thisUser = Meteor.users.findOne({_id: userId});
    if(thisUser && thisUser.profile && thisUser.profile.firstName) {
      let name = thisUser.profile.firstName + " " + thisUser.profile.lastName;
      DTSplits.find({memo: name}).map( function ( doc ) {
        total += doc.amount_in_cents;
      } );
    }
  } else {
    DTSplits.find().map( function ( doc ) {
      total += doc.amount_in_cents;
    } );
  }
  return (total / 100).toFixed( 2 );
};

export const getDeadlineTotal = ()=>{
  let total = 0;
  Deadlines.find().map( function ( doc ) {
    total += doc.amount;
  } );
  return (total).toFixed( 2 );
};
