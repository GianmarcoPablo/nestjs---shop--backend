import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
  ) { }

  async runSeed() {
    await this.insertNewProducts()
    return "Seed completed successfully"
  }
  private async insertNewProducts() {
    await this.productService.deleteAllProducts()

    const products = initialData.products

    const isertPromises = [];

    products.forEach(product => {
      isertPromises.push(this.productService.create(product))
    });

    await Promise.all(isertPromises)

    return "Products inserted successfully"
  }
}
