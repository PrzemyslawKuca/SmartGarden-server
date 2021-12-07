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
    pump: Boolean
    pump_fertilizer: Boolean
    light: Boolean
    fan: Boolean
    created_at: String
    updated_at: String
  }

  type Profiles{
    id: ID!
    name: String!
    schedule: [Schedule!]!
    created_at: String
    updated_at: String
  }

  type Schedule{
    id: ID!
    air_humidity: Float
    soil_humidity: Float
    air_temperature: Float
    light_level: Float
    start_date: String
    end_date: String
  }

  input ScheduleInput{
    air_humidity: Float
    soil_humidity: Float
    air_temperature: Float
    light_level: Float
    start_date: String
    end_date: String
  }

  type Query {
    me: User
    sensorReads: [SensorReads]
    settings: Settings
    profiles: [Profiles]
  }

  type Mutation {
    register(email: String!, password: String!, name: String!): Boolean
    login(email: String!, password: String!): User
    editUser(email: String, password: String, name: String): User
    setupSettings(mode: String, interval: Int): Settings
    updateSettings(mode: String, interval: Int, pump: Boolean, pump_fertilizer: Boolean, light: Boolean, fan: Boolean): Settings
    addProfile(name: String!, schedule: [ScheduleInput!]!): Profiles
    editProfile(id: ID!, name: String!, schedule: [ScheduleInput!]!): Profiles
  }
`;
