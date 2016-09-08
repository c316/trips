import casual from 'casual-browserify';
export const fillForms = ()=>{
  const password = casual.password;
  $("[name='firstname']").val(casual.first_name);
  $("[name='middlename']").val(casual.first_name);
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

