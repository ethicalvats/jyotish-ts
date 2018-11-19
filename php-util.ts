export class phpUtils{
    is_null(a: any){
        return a === null
    }
    ucfirst(string: string){
        let uc = string.toUpperCase()
        return uc[0]+string.slice(1, string.length)
    }
    array_key_exists(key, array){
        return array.hasOwnProperty(key)
    }
    in_array(val, array){
        return array.indexOf(val) >= 0
    }
    isset(variable){
        return variable === undefined
    }
    array_merge(arr1, arr2){
        return arr1.concat(arr2)
    }
}