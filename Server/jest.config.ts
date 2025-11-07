// Modify: jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    }
};

export default config;