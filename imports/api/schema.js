export const schema = [`
type Donation {
  amount: Int
  donationId: Int
  person_id: Int
}

type Query {
  dtFundId: Int
  dtFundDonations(id: Int!): [Donation]
}

schema {
  query: Query
}
`];

