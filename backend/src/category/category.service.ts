import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: dto,
    });

    await this.productService.invalidateCatalogCache();

    return category;
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Категорію з ID ${id} не знайдено`);
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    await this.productService.invalidateCatalogCache();

    return category;
  }

  async remove(id: string) {
    await this.findOne(id);

    const category = await this.prisma.category.delete({
      where: { id },
    });

    await this.productService.invalidateCatalogCache();

    return category;
  }
}
