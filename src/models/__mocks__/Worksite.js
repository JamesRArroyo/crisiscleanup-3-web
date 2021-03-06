import { MockWorksites, MockWorkTypes } from '@/utils/testing';

export default {
  all: jest.fn(() => MockWorksites),
  getWorkType: jest.fn(() => MockWorkTypes[0]),
  query: () => ({
    where: () => ({
      get: () => MockWorksites[0],
    }),
  }),
  api: () => ({
    get: () => MockWorksites[0],
  }),
};
