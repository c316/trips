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
