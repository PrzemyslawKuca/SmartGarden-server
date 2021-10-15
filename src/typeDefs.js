import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    hello: String!
    sensorReading: [SensorReading!]!
  }
  type SensorReading {
    id: ID!
    name: String!
  }
  type Mutation {
    createSensorReading(name: String!): SensorReading!
  }
`;