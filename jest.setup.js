const chrome = require('jest-chrome');

// Mock chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    lastError: null,
    onMessage: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  action: {
    setBadgeText: jest.fn(),
    openPopup: jest.fn()
  },
  notifications: {
    create: jest.fn()
  }
};

// Mock fetch API
global.fetch = jest.fn();

// Mock document.body.innerHTML for DOM testing
document.body.innerHTML = '';
