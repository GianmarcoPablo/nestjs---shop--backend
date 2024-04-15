import { IsString, IsNumber, IsArray, MinLength, IsPositive, IsOptional, IsInt, IsIn } from 'class-validator'


export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title: string

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsOptional()
    slug?: string

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number

    @IsArray()
    @IsString({ each: true })
    sizes: string[]

    @IsString()
    @IsIn(["men", "women", "kid", "unisex"])
    gender: string

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags: string[]

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[]
}
