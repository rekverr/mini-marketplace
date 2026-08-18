/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { ConflictException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { OrderService } from './order.service';

const queue = { add: jest.fn().mockResolvedValue({}) } as any;

function createService(overrides: Record<string, unknown> = {}) {
  const tx = {
    checkoutRequest: {
      create: jest.fn().mockResolvedValue({ id: 'request-1' }),
      update: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    order: {
      create: jest.fn().mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.NEW,
        orderItems: [],
      }),
    },
    cart: {
      findUnique: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
  };

  const prisma = {
    checkoutRequest: {
      findUnique: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(tx)),
    ...overrides,
  } as any;

  const cache = {
    clear: jest.fn().mockResolvedValue(null),
  } as any;

  return {
    service: new OrderService(prisma, queue, cache),
    prisma,
    tx,
    cache,
  };
}

describe('OrderService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses an atomic stock guard and Decimal totals', async () => {
    const { service, prisma, tx, cache } = createService();

    prisma.checkoutRequest.findUnique.mockResolvedValue(null);

    tx.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'product-1', quantity: 2 }],
    });

    tx.product.findUnique.mockResolvedValue({
      id: 'product-1',
      name: 'Keyboard',
      price: new Prisma.Decimal('19.99'),
    });

    tx.product.updateMany.mockResolvedValue({ count: 1 });

    await service.checkout('user-1', 'key-1');

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-1',
        stockQuantity: {
          gte: 2,
        },
      },
      data: {
        stockQuantity: {
          decrement: 2,
        },
      },
    });

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: new Prisma.Decimal('39.98'),
        }),
      }),
    );

    expect(queue.add).toHaveBeenCalledWith(
      'process-order',
      { orderId: 'order-1' },
      expect.objectContaining({
        jobId: 'order:order-1',
        attempts: 5,
      }),
    );

    expect(cache.clear).toHaveBeenCalled();
  });

  it('rolls back when guarded decrement rejects stock', async () => {
    const { service, prisma, tx, cache } = createService();

    prisma.checkoutRequest.findUnique.mockResolvedValue(null);

    tx.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'product-1', quantity: 1 }],
    });

    tx.product.findUnique.mockResolvedValue({
      id: 'product-1',
      name: 'Keyboard',
      price: new Prisma.Decimal('19.99'),
    });

    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.checkout('user-1', 'key-1')).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(tx.order.create).not.toHaveBeenCalled();
    expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
    expect(cache.clear).not.toHaveBeenCalled();
  });

  it('returns the same order for a repeated idempotency key', async () => {
    const { service, prisma, cache } = createService();

    const existing = {
      id: 'order-1',
      status: OrderStatus.NEW,
      orderItems: [],
    };

    prisma.checkoutRequest.findUnique.mockResolvedValue({
      order: existing,
    });

    await expect(service.checkout('user-1', 'same-key')).resolves.toEqual(
      existing,
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(cache.clear).not.toHaveBeenCalled();
  });

  it('allows only one of two concurrent checkouts to reserve the last unit', async () => {
    let stock = 1;
    let orderNumber = 0;

    const makeConcurrentService = () => {
      const tx = {
        checkoutRequest: {
          create: jest
            .fn()
            .mockResolvedValue({ id: `request-${++orderNumber}` }),
          update: jest.fn(),
        },
        cart: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'cart',
            items: [{ productId: 'p1', quantity: 1 }],
          }),
        },
        product: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'p1',
            name: 'Limited item',
            price: new Prisma.Decimal('10.00'),
          }),
          updateMany: jest.fn(async () => {
            await new Promise((resolve) => setImmediate(resolve));

            if (stock < 1) {
              return { count: 0 };
            }

            stock -= 1;

            return { count: 1 };
          }),
        },
        order: {
          create: jest.fn().mockImplementation(async () => ({
            id: `order-${++orderNumber}`,
            status: OrderStatus.NEW,
            orderItems: [],
          })),
        },
        cartItem: {
          deleteMany: jest.fn(),
        },
      };

      const prisma = {
        checkoutRequest: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
        $transaction: jest.fn((callback: any) => callback(tx)),
        order: {
          findMany: jest.fn(),
        },
      } as any;

      const cache = {
        clear: jest.fn().mockResolvedValue(null),
      } as any;

      return new OrderService(prisma, queue, cache);
    };

    const [a, b] = await Promise.allSettled([
      makeConcurrentService().checkout('u1', 'a'),
      makeConcurrentService().checkout('u2', 'b'),
    ]);

    expect(
      [a.status, b.status].filter((status) => status === 'fulfilled'),
    ).toHaveLength(1);

    expect(
      [a.status, b.status].filter((status) => status === 'rejected'),
    ).toHaveLength(1);

    expect(stock).toBe(0);
  });

  it('rejects arbitrary order status jumps and treats same-state retries as idempotent', async () => {
    const { service, prisma, cache } = createService();

    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.NEW,
    });

    await expect(
      service.updateOrderStatus('order-1', OrderStatus.COMPLETED),
    ).rejects.toBeInstanceOf(ConflictException);

    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.PROCESSING,
    });

    await expect(
      service.updateOrderStatus('order-1', OrderStatus.PROCESSING),
    ).resolves.toEqual(
      expect.objectContaining({
        status: OrderStatus.PROCESSING,
      }),
    );

    expect(prisma.order.update).not.toHaveBeenCalled();

    // no status change -> no cache invalidation
    expect(cache.clear).not.toHaveBeenCalled();
  });
});
