import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('Critical flow (e2e) - register/login -> add to cart -> checkout', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.checkoutRequest.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('registers, logs in, adds product to cart and checks out reducing stock and creating an order', async () => {
    const category = await prisma.category.create({
      data: { name: 'e2e-category' },
    });
    const initialStock = 5;
    const product = await prisma.product.create({
      data: {
        name: 'E2E Test Product',
        description: 'Product used in e2e tests',
        price: new Prisma.Decimal('9.99'),
        stockQuantity: initialStock,
        categoryId: category.id,
      },
    });

    const email = `e2e-user-${Date.now()}@example.com`;
    const password = 'secret123';
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const accessToken = loginRes.body?.accessToken;
    expect(accessToken).toBeDefined();

    const quantityToOrder = 2;
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId: product.id, quantity: quantityToOrder })
      .expect(201);

    const idempotencyKey = `e2e-key-${Date.now()}`;
    const checkoutRes = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send()
      .expect(201);

    const order = checkoutRes.body;
    expect(order).toBeDefined();
    expect(Array.isArray(order.orderItems)).toBe(true);
    expect(order.orderItems.length).toBeGreaterThanOrEqual(1);
    const orderedItem = order.orderItems.find(
      (it: any) => it.productId === product.id,
    );
    expect(orderedItem).toBeDefined();
    expect(orderedItem.quantity).toBe(quantityToOrder);

    const productAfter = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(productAfter).toBeDefined();
    expect(productAfter!.stockQuantity).toBe(initialStock - quantityToOrder);

    const orderFromDb = await prisma.order.findUnique({
      where: { id: order.id },
      include: { orderItems: true },
    });
    expect(orderFromDb).toBeDefined();
    expect(orderFromDb!.orderItems.length).toBeGreaterThanOrEqual(1);
  }, 20000);
});
