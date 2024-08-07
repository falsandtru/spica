// TLRU: True LRU
// TRC: True Recency-based Cache

export * from './tlru.clock';

/*
真に最近性に基づく真のLRU。
最近性には有参照間、無参照間、有無参照間の3つがある。
LRUは有無参照間の最近性を喪失しClockは有参照間の最近性を喪失する。
TLRUはすべての最近性を保持する。
パラメータを調整しやすく用途に合わせてヒット率を上げやすい。
stepパラメータはヒットエントリを重み付けおよび保護しており
demotion=100で重み付けと保護なしの純粋なTLRUを設定できる。
windowパラメータでSLRU同様捕捉可能最小再利用距離を設定できるが
降格区間内では捕捉可能再利用距離が半減しSLRUより短くなる。
DWCより高速かつ堅牢でアプリケーションのインメモリキャッシュなどの
極端に変化の大きいアクセスパターンにも適応する。

*/

/*
LRUとClockは偽の最近性に基づく誤ったアルゴリズムにより性能が大幅に低下する。
真の最近性は偽の最近性よりも非常に優れている。

エントリ間の最近性関係には使用済みと使用済み、使用済みと未使用、未使用と未使用の3種類がある。
ただしLRUとClockは一部の最近性に違反する。真のLRUはすべての最近性を維持することにより
LRUとClockよりも優れた性能を発揮する。

LRUの根本的誤りは新しいエントリを最近使用されたと見なすことである。実際それがキャッシュ内で
使用されたことはない。従って新しいエントリは実際に使用されたエントリの後ろに追加する必要がある。

```
Sequence: 1, 2, 3, 3, 2, 4

LRU

  MRU |4 2 3 1| LRU
  Hit |0 1 1 0|
        ^ Violation of the recency between used and unused.

Clock

  N-1 |4 3 2 1| 0
  Hit |0 1 1 0|
          ^ Violation of the recency between used and used.

True LRU

  MRU |2 3 4 1| LRU
  Hit |1 1 0 0|
        ^ ^ ^ Ideal recency(Recency-complete).
```

この最近性はClockですでに使用され普及していることから奇異でも不合理でもないことが証明されて
おりLRUよりClockの方がヒット率が同等または非常に高いことから使用済みエントリ間の最近性より
未使用エントリとの最近性の方が効果が高く重要であることがわかる。

またClockはLRUの近似アルゴリズムとして知られているがLRUとClockはこのように異なる種類の最近性
に基づくアルゴリズムであることからClockは実際にはLRUの近似アルゴリズムではなく異なる種類の
最近性に基づくまったく異なる最近性基準アルゴリズムである。

|Algorithm|Used-Used|Used-Unused|Unused-Unused|
|:-------:|:-------:|:---------:|:-----------:|
|LRU      |✓        |           |✓           |
|Clock    |         |✓          |✓           |
|True LRU |✓        |✓          |✓           |

再利用距離と同様に使用済みと未使用の最近性には有限と無限の差があり差を埋める方法には
様々な方法が考えられこの調整可能性はTrue LRUとClockにのみ存在しLRUには存在しない。

True LRUにおけるLRUからの大幅な改善はすべてのアルゴリズムの改善の過半が未使用のエントリを
偶然削除したことによるものを独自の改善として混同および錯覚したものであり各アルゴリズムの
独自性による改善は小さいか半分に満たないことを示している。True LRUをLRUの代わりに真の
ベースラインとすると他のアルゴリズムは特に汎用性においてあまり魅力的な性能を達成していない。

*/
