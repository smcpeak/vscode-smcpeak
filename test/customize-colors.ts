// https://stackoverflow.com/questions/46452646/customize-syntax-highlighting-colors-of-data-types-and-variables-for-typescript
interface OnInit {
}

export class ProductListComponent implements OnInit {

    pageTitle: string = 'Product List';
    imageWidth: number = 50;
    imageMargin: number = 2;
    showImage: boolean = false;
    errorMessage: string;

    _listFilter: string;

    get listFilter(): string {
        return this._listFilter;
    }

    set listFilter(value: string) {
        this._listFilter = value;

        this.filteredProducts = this.listFilter ? this.performFilter(this.listFilter) : this.products;
    }

    // Extra stuff to pacify tsc.
    filteredProducts: any;
    products: any;

    constructor()
    {
        this.errorMessage = 'hi';
        this._listFilter = '';
    }

    performFilter(a: any): any
    {
        return a;
    }
}
