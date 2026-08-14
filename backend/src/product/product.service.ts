import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto, SortBy, SortOrder } from './dto/get-products.dto';

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

    await this.clearProductCache();

    return product;
  }

  async findAll(query: GetProductsDto) {
    const cacheKey = `products_${JSON.stringify(query)}`;

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

    const where: any = {};

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

    const orderBy = {
      [sortBy ?? SortBy.NEWEST]: sortOrder ?? SortOrder.DESC,
    };

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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    await this.clearProductCache();

    return product;
  }

  async remove(id: string) {
    const product = await this.prisma.product.delete({
      where: { id },
    });

    await this.clearProductCache();

    return product;
  }

  private async clearProductCache() {
    const store =
      (this.cacheManager as any).store ??
      (this.cacheManager as any).stores?.[0];
    const client = store?.client ?? (this.cacheManager as any).client;

    if (client) {
      const keys = await client.keys('products_*');
      if (keys && keys.length > 0) {
        await client.del(keys);
      }
    }
  }
}
