import casual from 'casual-browserify';
export const fillForms = ()=>{
  const password = casual.password;
  $("[name='firstname']").val(casual.word);
  $("[name='middlename']").val(casual.word);
  $("[name='lastname']").val(casual.word);
  $("[name='address']").val(casual.address);
  $("[name='city']").val(casual.city);
  $("[name='state']").val(casual.state_abbr);
  $("[name='zip']").val(casual.zip);
  $("[name='email']").val(casual.email);
  $("[name='password']").val(password);
  $("[name='rpassword']").val(password);
  $('[name="tnc"]').prop('checked', true);
};
