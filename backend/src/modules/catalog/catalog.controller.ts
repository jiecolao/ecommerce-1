import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ListCatalogQueryDto } from './catalog.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('featured')
  getFeatured() {
    return this.catalogService.getFeaturedProducts();
  }

  @Get('products')
  listProducts(@Query() query: ListCatalogQueryDto) {
    return this.catalogService.listProducts(query);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProductById(parseInt(id, 10));
  }
}
