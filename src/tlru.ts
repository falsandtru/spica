// TLRU: True LRU
// TRC: True Recency-based Cache

/*
真に最近性に基づく真のLRU。
最近性には有参照間、無参照間、有無参照間の3つがある。
LRUは有無参照間の最近性を喪失しClockは有参照間の最近性を喪失する。
TLRUはすべての最近性を保持する。
DWCより高速かつ堅牢で小さいキャッシュサイズに適している。
パラメータを調整しやすくDWCより高ヒット率となることもある。

*/

export * from './tlru.clock';
