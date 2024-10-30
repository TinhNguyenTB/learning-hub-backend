import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { ResponseMessage, User } from '@/decorator/customize';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) { }

  @Post()
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  @ResponseMessage("Get all purchases for instructor")
  @Get()
  findAll(@Query("instructorId") instructorId: string) {
    return this.purchasesService.findAll(instructorId);
  }

  @ResponseMessage("Get purchase by courseId")
  @Get(':courseId')
  findOne(@Param('courseId') courseId: string, @User() user: IUser) {
    return this.purchasesService.findOne(courseId, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
    return this.purchasesService.update(+id, updatePurchaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchasesService.remove(+id);
  }
}
