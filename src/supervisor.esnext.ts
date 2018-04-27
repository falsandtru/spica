import { Supervisor } from './supervisor'; 
import { Coroutine } from './coroutine'; 

Coroutine.prototype[Supervisor.terminator] = Coroutine.prototype[Coroutine.terminator];
