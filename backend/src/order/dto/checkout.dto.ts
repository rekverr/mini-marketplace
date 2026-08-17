import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  idempotencyKey!: string;
}
