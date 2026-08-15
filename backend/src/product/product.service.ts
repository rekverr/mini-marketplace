import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto, SortBy, SortOrder } from './dto/get-products.dto';

type RedisCacheClient = {
  keys(pattern: string): Promise<string[]>;
  del(...keys: string[]): Promise<number>;
};

type CacheWithRedisClient = Cache & {
  store?: { client?: RedisCacheClient };
  stores?: Array<{ client?: RedisCacheClient }>;
  client?: RedisCacheClient;
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    await this.invalidateCatalogCache();

    return product;
  }

  async findAll(query: GetProductsDto) {
    const cacheKey = `products:list:${JSON.stringify(query)}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const orderDirection = sortOrder ?? SortOrder.DESC;
    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      (sortBy ?? SortBy.NEWEST) === SortBy.PRICE
        ? [{ price: orderDirection }, { id: 'asc' }]
        : [{ createdAt: orderDirection }, { id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit ?? 10,
        orderBy,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    const result = {
      data,
      meta: {
        total,
        page: page ?? 1,
        limit: limit ?? 10,
        totalPages: Math.ceil(total / (limit ?? 10)),
      },
    };

    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async findOne(id: string) {
    const cacheKey = `products:item:${id}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException();
    }

    await this.cacheManager.set(cacheKey, product);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    await this.invalidateCatalogCache(id);

    return product;
  }

  async remove(id: string) {
    const product = await this.prisma.product.delete({
      where: { id },
    });

    await this.invalidateCatalogCache(id);

    return product;
  }

  async invalidateCatalogCache(productId?: string) {
    const cacheWithClient = this.cacheManager as CacheWithRedisClient;
    const store = cacheWithClient.store ?? cacheWithClient.stores?.[0];
    const client = store?.client ?? cacheWithClient.client;

    if (client) {
      const keys = await client.keys('products:list:*');
      if (keys && keys.length > 0) {
        await client.del(...keys);
      }
      if (productId) {
        await client.del(`products:item:${productId}`);
      }
    }
  }
}
