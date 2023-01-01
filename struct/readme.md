# Initialization of Structure Node: in V8

To speed up the execution, an initialization of node
is needed. And it's better to use a specific object
to act as node. For the following reasons, as in V8:

1. Avoid prototype accessing.
2. In-object and fast [properties][1].
3. Better construction of [hidden class][1].
"[ONE SHAPE IS GOOD][2]" to the boost and optimization of
Ignition and TurboFan. See also, [inline cache][3].

[1]:https://v8.dev/blog/fast-properties
[2]:https://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html
[3]:https://mrale.ph/blog/2012/06/03/explaining-js-vms-in-js-inline-caches.html

## Example

With `HeapQueue.initNode()`:
```javascript
var queue = new HeapQueue(),
    node = {},
    obj = {};
queue.initNode(node);
node.val = obj;
obj.node = node;
```
Or, with `HeapQueue.makeNode()`:
```javascript
obj.node = queue.makeNode(obj);
```
Then, to enqueue `obj`:
```javascript
queue.enqueue(obj.node);
```
Get `obj` through dequeue:
```javascript
obj = queue.dequeue().val;
```

# Base Structure

For now, there are 3 kinds of base structures:
heap, link, tree.
Structures in class-style (so-called "high-level structure")
are implemented based on these base structures.
So one node cannot be stored simultaneously in two 
high-level structures which have some of the same
base structures, as it is eventually stored in those
same base structures.

The base structures of a high-level structure
are marked on it by the comments of class.

Any future high-level structures should be marked
with their bases, too.

# Update of the Priority

To update the priority of a node, ensure that
the node is not in any priority-based structure
which is based on the target priority.
That is, for example, if a node is in a TreeList,
to update its priority, it should be first removed
from the TreeList and then update its priority, and
finally added back to the TreeList.

In other words, if a property of the node stores
the priority, it should not be changed while the
node is in a structure based on that property.

# MAX_SAFE_SIZE

The MAX_SAFE_SIZE of a structure is a theoretical
safe number, via the analysis of the algorithm
and the data structures embedded in the target structure.
However, because of the limitation of the
embedded data structure and the memory capacity, the actual
available number can be less than MAX_SAFE_SIZE.
