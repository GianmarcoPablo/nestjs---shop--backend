import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async runSeed() {
    await this.deleteTables()
    const adminUser = await this.insertUsers()
    await this.insertNewProducts(adminUser)
    return "Seed completed successfully"
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts()
    await this.userRepository.delete({})
  }

  private async insertUsers() {
    const seedUsers = initialData.users
    const users: User[] = []
    seedUsers.forEach(seedUser => {
      users.push(this.userRepository.create(seedUser))
    });
    const dbUser = await this.userRepository.save(seedUsers)
    return dbUser[0]
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts()

    const products = initialData.products

    const isertPromises = [];

    products.forEach(product => {
      isertPromises.push(this.productService.create(product, user))
    });

    await Promise.all(isertPromises)

    return "Products inserted successfully"
  }
}
