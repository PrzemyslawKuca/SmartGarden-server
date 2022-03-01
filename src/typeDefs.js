import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Tokens{
    access_token: String!
    refresh_token: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    confirmed: Boolean!
    role: String
    created_at: String!
    updated_at: String!
  }

  type SensorReads{
    id: ID!
    air_humidity: Float
    soil_humidity: Float
    air_temperature: Float
    air_pressure: Float
    light_level: Float
    cpu_temperature: Float
    created_at: String
  }

  type Settings{
    id: ID
    mode: String
    current_plan: ID
    interval: Int
    pump: Boolean
    pump_fertilizer: Boolean
    light: Boolean
    fan: Boolean
    created_at: String
    updated_at: String
  }

  type ManualProfile{
    id: ID
    air_humidity: Float
    soil_humidity: Float
    air_temperature: Float
    light: LightTimetable
    created_at: String
    updated_at: String
  }

  type Profiles{
    id: ID
    name: String
    schedule: [Schedule]
    started_at: String
    created_at: String
    updated_at: String
  }

  type HistoryPagination{
    totalLength: Int
    hasMore: Boolean
    history: [History]
  }

  type History{
    id: ID
    comment: String
    created_at: String
  }

  type Schedule{
    id: ID
    air_humidity: Float
    soil_humidity: Float
    air_temperature: Float
    light: LightTimetable
    start_date: String
    duration: Int
  }

  type LightTimetable{
    start_hour: String
    end_hour: String
    minimumLevel: Int
  }

  input ScheduleInput{
    air_humidity: Float
    soil_humidity: Float
    air_temperature: Float
    duration: Int
    light: LightTimetableInput
    start_date: String
    end_date: String
  }

  input LightTimetableInput{
    start_hour: String
    end_hour: String
    minimumLevel: Int
  }

  type Query {
    me: User
    users: [User]
    sensorReads(start_date: String, end_date: String): [SensorReads]
    lastSensorsReading: SensorReads
    settings: Settings
    profiles(id: ID): [Profiles]
    history(offset: Int, limit: Int): HistoryPagination
    manualProfile: ManualProfile
  }

  type Mutation {
    register(email: String!, password: String!, name: String!): Boolean
    login(email: String!, password: String!): Tokens
    resetPassword(email: String!): Boolean
    setNewPassword(token: String!, password: String!): Boolean
    confirmProfile(email: String!): Boolean
    addUser(email: String, name: String): Boolean
    editUser(email: String, password: String, name: String, role: String): User
    deleteUser(id: ID!): Boolean
    setupSettings(mode: String, interval: Int): Settings
    updateSettings(mode: String, interval: Int, current_plan: ID, pump: Boolean, pump_fertilizer: Boolean, light: Boolean, fan: Boolean): Settings
    addProfile(name: String!, schedule: [ScheduleInput!]!): Profiles
    addManualProfile(air_humidity: Int!, soil_humidity: Int!, air_temperature: Int!, light: LightTimetableInput!): ManualProfile
    deleteProfile(id: ID!): Boolean
    editProfile(id: ID!, name: String!, schedule: [ScheduleInput!]!): Profiles
  }
`;
