/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { ConflictException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { OrderService } from './order.service';

describe('OrderService', () => {
  const createService = (prismaOverrides: Record<string, unknown> = {}) => {
    const tx = {
      product: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      order: {
        create: jest.fn(),
      },
      cartItem: {
        deleteMany: jest.fn(),
      },
    };

    const prisma = {
      cart: {
        findUnique: jest.fn(),
      },
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => Promise.resolve(callback(tx))),
      ...prismaOverrides,
    } as any;

    const queue = {
      add: jest.fn(),
    } as any;

    const service = new OrderService(prisma, queue);

    return { service, prisma, tx, queue };
  };

  it('decrements inventory with an atomic stock guard during checkout', async () => {
    const { service, prisma, tx, queue } = createService();

    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'product-1', quantity: 2 }],
    });
    tx.product.findUnique.mockResolvedValue({
      id: 'product-1',
      name: 'Keyboard',
      price: new Prisma.Decimal('19.99'),
    });
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.order.create.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.NEW,
      orderItems: [],
    });

    await service.checkout('user-1');

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-1',
        stockQuantity: { gte: 2 },
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
    expect(queue.add).toHaveBeenCalledWith('process-order', {
      orderId: 'order-1',
    });
  });

  it('rolls back checkout when the guarded decrement cannot reserve stock', async () => {
    const { service, prisma, tx, queue } = createService();

    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'product-1', quantity: 1 }],
    });
    tx.product.findUnique.mockResolvedValue({
      id: 'product-1',
      name: 'Keyboard',
      price: new Prisma.Decimal('19.99'),
    });
    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.checkout('user-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('rejects arbitrary order status jumps', async () => {
    const { service, prisma } = createService();

    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.NEW,
    });

    await expect(
      service.updateOrderStatus('order-1', OrderStatus.COMPLETED),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});
