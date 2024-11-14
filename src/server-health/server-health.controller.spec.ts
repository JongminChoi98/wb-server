import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { ServerHealthController } from './server-health.controller';

describe('ServerHealthController', () => {
  let controller: ServerHealthController;
  let mockConnection: Partial<Connection>;

  beforeAll(async () => {
    mockConnection = {
      readyState: 1,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServerHealthController],
      providers: [
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    controller = module.get<ServerHealthController>(ServerHealthController);
  });

  function setReadyState(state: number) {
    Object.defineProperty(mockConnection, 'readyState', { value: state });
  }

  it('should return server health status', async () => {
    setReadyState(1);
    const result = await controller.checkHealth();
    expect(result).toEqual({
      status: 'ok',
      database: 'connected',
      uptime: expect.any(Number),
      timestamp: expect.any(String),
    });
  });

  it('should return "disconnected" when the database is disconnected', async () => {
    setReadyState(0);
    const result = await controller.checkHealth();
    expect(result.database).toBe('disconnected');
  });

  it('should return "connecting" when the database is connecting', async () => {
    setReadyState(2);
    const result = await controller.checkHealth();
    expect(result.database).toBe('connecting');
  });

  it('should return "disconnecting" when the database is disconnecting', async () => {
    setReadyState(3);
    const result = await controller.checkHealth();
    expect(result.database).toBe('disconnecting');
  });

  it('should return "unknown" when the database state is unrecognized', async () => {
    setReadyState(99);
    const result = await controller.checkHealth();
    expect(result.database).toBe('unknown');
  });
});
