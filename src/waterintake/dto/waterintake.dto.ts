import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class WaterintakeDto {
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }
}
