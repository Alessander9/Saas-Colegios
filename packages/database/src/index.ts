import { PrismaClient } from '@prisma/client';
import { DomainEvent } from '@cole/domain-types';

export * from '@prisma/client';

export class DatabaseClient {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log: process.env['NODE_ENV'] === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });
    }
    return DatabaseClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
    }
  }
}

export const db = DatabaseClient.getInstance();

export async function disconnectDatabase(): Promise<void> {
  await DatabaseClient.disconnect();
}

/**
 * Helper to execute database mutations and store domain events into Outbox atomically
 */
export async function withTransactionAndOutbox<T>(
  prisma: PrismaClient,
  _tenantId: string,
  events: DomainEvent[],
  operation: (tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    // 1. Execute Domain Operation
    const result = await operation(tx);

    // 2. Store Outbox Events in the same SQL Transaction
    for (const event of events) {
      await (tx as unknown as PrismaClient).outbox.create({
        data: {
          id: event.eventId,
          tenantId: event.tenantId,
          eventType: event.eventType,
          aggregateType: event.eventType.split('.')[0] || 'Unknown',
          aggregateId: event.aggregateId,
          correlationId: event.correlationId,
          payload: event.payload as any,
          status: 'PENDING',
        },
      });
    }

    return result;
  });
}
