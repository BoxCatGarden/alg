var {prior: priord, init_node, heapify, enqueue, dequeue, remove, not_in_heap} =
    require('./heap.js');

/** a priority queue based on heap. <br/>
 * priority rule: <br/>
 * priority-descending order. a node will be previous to those which have
 * a lower priority than it. the order of nodes with the same priority has no
 * guarantee, no matter what time they are enqueued. however, to enqueue or
 * remove a node with the same priority as the first node's will not replace
 * the first node unless it is the first node itself. <br/>
 * if and only if prior(A, B) is true, node A has a higher priority than node B.
 *
 * base structure: heap
 * @see constructor */
class HeapQueue {
    /**
     * @param prior - prior(a, b). priority comparator.
     *     prior(a, b) should be true if and only if 'a' is prior to 'b'.
     *     input 'a' and 'b' will not be null. ('a' !== 'b') will always stand.
     *     prior() should return a value indicating true or false.
     * @param arr - an array to be initialized as a heap. the elements
     *     will be copied to the heap array and 'arr' won't change.
     *     if not null, length of arr must be no more than 2**30,
     *     and arr[i] should be a node and must NOT be null or in any base structure.
     *     optional, can be null */
    constructor(prior, arr) {
        this.prior = prior ?? priord;
        if (arr?.length) {
            arr = [...arr];
            heapify(this.prior, arr, arr.length);
            this.arr = arr;
        } else {
            this.arr = [];
        }
        this.ln = this.arr.length;
    }

    /**
     * @return - max safe number of nodes in this queue.
     *     it may lead to unexpected behaviors to have nodes more than this number. */
    get MAX_SAFE_SIZE() {
        return 2 ** 30;
    }

    /** initialize node. not necessary unless to avoid any accessing
     * to its prototype for non-existent properties.
     * @param node - node to initialize. must NOT in any base structure, not null */
    static initNode(node) {
        init_node(node);
    }

    /** make a node, initialize and return it.
     * 'val' will be stored in property node.val.
     * @param val - value stored in node.
     *     if omitted, node.val will be defined and assigned with 'undefined'.
     *     optional
     * @return - the made node */
    static makeNode(val) {
        var node = {};
        init_node(node);
        node.val = val;
        return node;
    }

    /** @see HeapQueue.initNode */
    initNode(node) {
        HeapQueue.initNode(node);
    }

    /** @see HeapQueue.makeNode */
    makeNode(val) {
        return HeapQueue.makeNode(val);
    }

    /** enqueue node.
     * @param node - node to enqueue. must NOT in any base structure, not null */
    enqueue(node) {
        this.ln = enqueue(node, this.prior, this.arr, this.ln);
    }

    /** dequeue the first node in this queue, and return it.
     * there must be some nodes in this queue (.size > 0).
     * @return - the first node in this queue. unknown if no node
     * @see size */
    dequeue() {
        var node = this.arr[0];
        this.ln = dequeue(this.prior, this.arr, this.ln);
        return node;
    }

    /** remove node from this queue.
     * @param node - node to remove. must in this queue, not null */
    remove(node) {
        this.ln = remove(node, this.prior, this.arr, this.ln);
    }

    /** get the first node in this queue.
     * ensure that (.size > 0) when using it.
     * @return - first node in this queue. unknown if no node
     * @see size */
    first() {
        return this.arr[0];
    }

    /** @return - number of nodes in this queue */
    get size() {
        return this.ln;
    }

    /** return true if and only if node is in this queue.
     * @param node - not null
     * @return - boolean */
    has(node) {
        if (not_in_heap(node)) {
            return false;
        }
        var i = node._lh_idx;
        return i < this.ln && this.arr[i] === node;
    }

    /** return true if and only if node is NOT in any base structure.
     * @param node - not null
     * @return - boolean */
    canHave(node) {
        return not_in_heap(node);
    }

    /** trim off the storage that is not in use. */
    trim() {
        if (this.arr.length > this.ln) {
            this.arr.length = this.ln;
        }
    }
}


module.exports = {HeapQueue};
