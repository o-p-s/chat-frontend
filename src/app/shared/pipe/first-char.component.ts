import {Pipe , PipeTransform} from '@angular/core';
@Pipe({
    name:'firstCharPipe'
})
export class FirstCharPipe implements PipeTransform{
    transform(value:string):string{
        return value.charAt(0).toUpperCase();
    }
}