import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MyGroupOrders from '../pages/MyGroupOrders';
import { BrowserRouter } from 'react-router-dom';
import api from '../api/axios';

// Mock the API module
jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

// Mock the Context
jest.mock('../context/GroupOrderContext', () => ({
  useGroupOrder: () => ({
    setGroupOrder: jest.fn()
  })
}));

describe('MyGroupOrders Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state initially', () => {
    // Return a pending promise to keep it loading
    api.get.mockImplementation(() => new Promise(() => { }));
    render(<BrowserRouter><MyGroupOrders /></BrowserRouter>);
    expect(screen.getByText(/loading your group orders/i)).toBeInTheDocument();
  });

  test('displays orders when api succeeds', async () => {
    const orders = [{
      _id: '1',
      shareCode: 'CODE123',
      status: 'open',
      total: 10,
      participants: [],
      createdAt: new Date().toISOString()
    }];
    api.get.mockResolvedValue({ data: { groupOrders: orders } });

    render(<BrowserRouter><MyGroupOrders /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('CODE123')).toBeInTheDocument();
      expect(screen.getByText(/status:/i)).toBeInTheDocument();
    });
  });

  test('displays empty state when no orders', async () => {
    api.get.mockResolvedValue({ data: { groupOrders: [] } });
    render(<BrowserRouter><MyGroupOrders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText(/You don't have any group orders yet/i)).toBeInTheDocument();
    });
  });
});
