import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateRatingDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsNumber()
  @IsNotEmpty()
  quality: number;
}
