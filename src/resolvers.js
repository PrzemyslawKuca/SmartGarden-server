import { SensorReading } from "./models/sensorReading.js";

export const resolvers = {
  Query: {
    hello: () => "hi",
    sensorReading: async () => await SensorReading.find({})
  },
  Mutation: {
    createSensorReading: async (_, { name }) => {
      const sensorReading = new SensorReading({ name });
      await sensorReading.save();
      return sensorReading;
    }
  }
};