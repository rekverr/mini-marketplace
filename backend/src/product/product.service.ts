import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto, SortBy, SortOrder } from './dto/get-products.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

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
    const queryHash = createHash('sha256')
      .update(JSON.stringify(query))
      .digest('hex');
    const cacheKey = `products:list:${queryHash}`;

    let cachedData: unknown;
    try {
      cachedData = await this.cacheManager.get(cacheKey);
    } catch {
      this.logger.warn(`CATALOG_CACHE_READ_FAILED key=${cacheKey}`);
    }
    if (cachedData) return cachedData;

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

    try {
      await this.cacheManager.set(cacheKey, result);
    } catch {
      this.logger.warn(`CATALOG_CACHE_WRITE_FAILED key=${cacheKey}`);
    }

    return result;
  }

  async findOne(id: string) {
    const cacheKey = `products:item:${id}`;
    let cachedData: unknown;
    try {
      cachedData = await this.cacheManager.get(cacheKey);
    } catch {
      this.logger.warn(`CATALOG_CACHE_READ_FAILED key=${cacheKey}`);
    }
    if (cachedData) return cachedData;

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException();
    }

    try {
      await this.cacheManager.set(cacheKey, product);
    } catch {
      this.logger.warn(`CATALOG_CACHE_WRITE_FAILED key=${cacheKey}`);
    }

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
    try {
      // The catalog cache is intentionally isolated to product data. Clearing it
      // after any stock/product mutation is safer than relying on Redis key
      // enumeration, which differs between cache-manager store versions.
      await this.cacheManager.clear();
    } catch {
      this.logger.warn(
        `CATALOG_CACHE_INVALIDATION_FAILED productId=${productId ?? 'all'}`,
      );
    }
  }
}
