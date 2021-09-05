export interface KeyValuePair<T1, T2> {
    key: T1;
    value: T2;
}

export function getUniquePairs<T1, T2>(items: KeyValuePair<T1, T2>[]): KeyValuePair<T1, T2>[] {
    var uniqueItems = Array.from(new Set(items.map(s => s.key)))
    .map(key => {
        return {
            key: key,
            value: items.find(i => i.key === key).value
        } as KeyValuePair<T1, T2>;
   });
   return uniqueItems;
}