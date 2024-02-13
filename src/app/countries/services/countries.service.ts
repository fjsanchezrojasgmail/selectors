import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, combineLatest, map, of, tap } from 'rxjs';

import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';



@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';
  private borders: string[] = [];

  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ]

  constructor(
    private http: HttpClient
  )
   {}

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountriesByRegion( region: Region ): Observable<SmallCountry[]>{

      if(!region) return of([]);//devolver un Observable de un array vacio

      const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`;

      return this.http.get<Country[]>(url)
        .pipe(
          map( countries => countries.map( country => ({
              name: country.name.common,
              cca3: country.cca3,
              borders: country.borders ?? []//operacion de coalescencia nula, da un valor por defecto si el valor es null or undefined
          }))),
          tap( response => console.log({ response })
          )
        );


  }

  getCountryByAlphaCode( alphaCode: string ): Observable<SmallCountry>{



    const url: string = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;

    return this.http.get<Country>(url)
      .pipe(
        map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []//operacion de coalescencia nula, da un valor por defecto si el valor es null or undefined
        })))


    }

    getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {

      if( !borders || borders.length === 0 ) return of([]);

      const countriesRequests: Observable<SmallCountry>[] = [];

      borders.forEach( code => {
        const request = this.getCountryByAlphaCode( code );
        countriesRequests.push( request );
      });

      return combineLatest(countriesRequests);

    }


}
