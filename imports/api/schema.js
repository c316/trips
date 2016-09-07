const logger = { log: (e) => console.log(e) };

export const schema = [`

type Splits {
    amount_in_cents:Int
    donation_id:Int
    fund_id:Int
    id:Int
    memo:String
    donation:Donation
}

type Donation {
  amount_in_cents: Int
  bank_name: String
  bank_number: String
  batch_date: String
  batch_number: String
  check_date: String
  check_number: String
  completed_at: String
  created_at: String
  currency: String
  declined_reason: String
  donation_type_id: Int
  id: Int
  intact_id: String
  legacy_id: String
  memo: String
  payment_status: String
  persona_id: Int
  pledge_id: String
  received_on: String
  source_id: Int
  transaction_fee_in_cents: Int
  transaction_id: String
  updated_at: String
  person:Person
}

type Person {
  birthday:                    String
  company_name:                String
  created_at:                  String
  deceased:                    Boolean
  department:                  String
  gender:                      Int
  id:                          Int
  is_company:                  Boolean
  job_title:                   String
  legacy_id:                   String
  meta:                        String
  recognition_name:            String
  salutation:                  String
  salutation_formal:           String
  updated_at:                  String  
  names:                       [Name]
  addresses:                   [Address]
  phone_numbers:               [PhoneNumber]
  email_addresses:             [EmailAddress]
}

type Name {
  first_name:   String
  id:           Int
  last_name:    String
  middle_name:  String
  name_type_id: String
  position:     Int
  prefix:       String
}

type Address {
  address_type_id: String
  city:            String
  country:         String
  do_not_mail:     Boolean
  id:              Int
  position:        Int
  postal_code:     String
  state:           String
  street_address:  String
  time_zone:       String
}

type PhoneNumber {
  address_type_id: String
  do_not_call:     Boolean
  extension:       String
  id:              Int
  phone_number:    String
  position:        Int
}

type EmailAddress {
  address_type_id: String
  do_not_email:    Boolean
  email_address:   String
  id:              Int
  position:        Int
}


type RootQuery {
  Splits(id: Int!): [Splits]
}

schema {
  query: RootQuery
}

`];

