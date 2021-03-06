export const phoneUS = () => {
  $.validator.addMethod('phoneUS', function(phone_number, element) {
    phone_number = phone_number.replace(/\s+/g, '');
    return this.optional(element) || phone_number.length > 9 &&
      phone_number.match(/^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d{4}$/);
  }, 'Please specify a valid phone number');
};

export const zipcode = () => {
  $.validator.addMethod('zipcode', function(value, element) {
    return this.optional(element) || /^\d{5}(?:-\d{4})?$/.test(value);
  }, 'Please provide a valid zipcode.');
};
