import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, In, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from "uuid"
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger("ProductsService")

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {

      const { images = [], ...productDetails } = createProductDto

      const product = this.productRepository.create({
        ...createProductDto,
        images: images.map(image => this.productImageRepository.create({ url: image }))
      })
      await this.productRepository.save(product)
      return { ...product, images }
    } catch (error) {
      this.handleExpception(error)
    }
  }

  findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { limit, offset } = paginationDto
    return this.productRepository.find({
      take: limit,
      skip: offset
      //TODO: RELATIONS
    })
  }

  async findOne(term: string): Promise<Product> {

    let product: Product
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product')
      queryBuilder.where(`UPPER(title) =:title or slug =:slug`, {
        title: term.toUpperCase(),
        slug: term.toLocaleLowerCase()
      })
      product = await queryBuilder.getOne()
    }

    if (!product) {
      throw new NotFoundException(`Product with term ${term} not found`)
    }

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images = [], ...productDetails } = updateProductDto

    const product = await this.productRepository.preload({
      id,
      ...productDetails,
    })
    if (!product) { throw new NotFoundException(`Product with id ${id} not found`) }

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } })
        product.images = images.map(image => this.productImageRepository.create({ url: image }))
      } else {
        product.images = await this.productImageRepository.findBy({ product: { id } })
      }
      await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      await queryRunner.release()
      return product
    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      this.handleExpception(error)
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
    return "Product deleted successfully"
  }

  private handleExpception(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error)
    throw new InternalServerErrorException('Error creating product')
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder("product")
    try {
      return await query.delete().where({}).execute()
    } catch (error) {
      this.handleExpception(error)
    }
  }
}
