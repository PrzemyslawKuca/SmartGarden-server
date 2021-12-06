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

  type SensorReads{
    id: ID!
    air_humidity: Float
    soil_humidity: Float
    air_temperature: Float
    air_presuer: Float
    light_level: Float
    cpu_temperature: Float
    created_at: String
  }

  type Settings{
    id: ID!
    mode: String
    interval: Int
    created_at: String
    updated_at: String
  }

  type Query {
    me: User
    sensorReads: [SensorReads]
    settings: Settings
  }

  type Mutation {
    register(email: String!, password: String!, name: String!): Boolean!
    login(email: String!, password: String!): User
    inputSettings(mode: String, interval: Int): Settings
    updateSettings(mode: String, interval: Int): Settings
  }
`;
