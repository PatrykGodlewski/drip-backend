import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { toNumber } from 'src/common/helper/cast.helper';

export class ParamDto {
  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @IsPositive()
  @IsNotEmpty()
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}
