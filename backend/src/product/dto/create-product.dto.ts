import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @IsString()
  @IsUrl({ require_protocol: true })
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}
