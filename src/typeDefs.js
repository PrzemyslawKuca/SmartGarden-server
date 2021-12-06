import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    confirmed: Boolean!
    created_at: String!
    updated_at: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(email: String!, password: String!, name: String!): Boolean!
    login(email: String!, password: String!): User
    confirmEmail(email: String!): Boolean!
  }
`;
